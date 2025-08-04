package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// TODO: Implement proper origin checking based on website settings
		return true
	},
}

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer
	maxMessageSize = 512
)

// Hub maintains the set of active clients and broadcasts messages to the clients
type Hub struct {
	// Registered clients grouped by website ID
	clients map[uint]map[*Client]bool

	// Inbound messages from the clients
	broadcast chan *Message

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Mutex for thread safety
	mu sync.RWMutex

	// Message handlers
	messageHandlers map[string]func(*Client, *Message)
}

// Client is a middleman between the websocket connection and the hub
type Client struct {
	hub *Hub

	// The websocket connection
	conn *websocket.Conn

	// Buffered channel of outbound messages
	send chan []byte

	// Client metadata
	SessionID string
	WebsiteID uint
	UserAgent string
	IP        string
	Language  string
	ConnectedAt time.Time

	// Client state
	isActive bool
	mu       sync.RWMutex
}

// Message represents a websocket message
type Message struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	SessionID string      `json:"session_id,omitempty"`
	WebsiteID uint        `json:"website_id,omitempty"`
	Timestamp int64       `json:"timestamp"`
	Client    *Client     `json:"-"` // Reference to sender client
}

// ChatMessage represents a chat message
type ChatMessage struct {
	ID       uint   `json:"id,omitempty"`
	Content  string `json:"content"`
	Sender   string `json:"sender"`
	Language string `json:"language,omitempty"`
}

// NewHub creates a new Hub
func NewHub() *Hub {
	hub := &Hub{
		broadcast:       make(chan *Message),
		register:        make(chan *Client),
		unregister:      make(chan *Client),
		clients:         make(map[uint]map[*Client]bool),
		messageHandlers: make(map[string]func(*Client, *Message)),
	}

	// Register default message handlers
	hub.registerMessageHandlers()
	
	return hub
}

// registerMessageHandlers registers default message handlers
func (h *Hub) registerMessageHandlers() {
	h.messageHandlers["chat_message"] = h.handleChatMessage
	h.messageHandlers["typing_start"] = h.handleTypingStart
	h.messageHandlers["typing_stop"] = h.handleTypingStop
	h.messageHandlers["join_chat"] = h.handleJoinChat
	h.messageHandlers["leave_chat"] = h.handleLeaveChat
	h.messageHandlers["ping"] = h.handlePing
}

// Run starts the hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.registerClient(client)

		case client := <-h.unregister:
			h.unregisterClient(client)

		case message := <-h.broadcast:
			h.handleBroadcast(message)
		}
	}
}

// registerClient registers a new client
func (h *Hub) registerClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.clients[client.WebsiteID] == nil {
		h.clients[client.WebsiteID] = make(map[*Client]bool)
	}
	h.clients[client.WebsiteID][client] = true

	log.Printf("Client registered: %s for website %d", client.SessionID, client.WebsiteID)

	// Send welcome message
	client.SendMessage("connection_established", map[string]interface{}{
		"session_id": client.SessionID,
		"timestamp":  time.Now().Unix(),
	})
}

// unregisterClient unregisters a client
func (h *Hub) unregisterClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if websiteClients, ok := h.clients[client.WebsiteID]; ok {
		if _, ok := websiteClients[client]; ok {
			delete(websiteClients, client)
			close(client.send)

			// Clean up empty website groups
			if len(websiteClients) == 0 {
				delete(h.clients, client.WebsiteID)
			}
		}
	}

	log.Printf("Client unregistered: %s from website %d", client.SessionID, client.WebsiteID)
}

// handleBroadcast handles message broadcasting
func (h *Hub) handleBroadcast(message *Message) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	// Handle message based on type
	if handler, exists := h.messageHandlers[message.Type]; exists {
		handler(message.Client, message)
	} else {
		log.Printf("Unknown message type: %s", message.Type)
	}
}

// Message handlers
func (h *Hub) handleChatMessage(client *Client, message *Message) {
	// Extract message data
	data, ok := message.Data.(map[string]interface{})
	if !ok {
		log.Printf("Invalid message data format from %s", client.SessionID)
		return
	}
	
	content, ok := data["content"].(string)
	if !ok || content == "" {
		log.Printf("Invalid message content from %s", client.SessionID)
		return
	}
	
	// TODO: Save message to database using ChatService
	// For now, just log and broadcast
	log.Printf("Chat message from %s: %s", client.SessionID, content)
	
	// Create response message
	responseMessage := &Message{
		Type: "message_received",
		Data: map[string]interface{}{
			"session_id": client.SessionID,
			"content":    content,
			"timestamp":  time.Now().Unix(),
			"sender":     "user",
		},
		Timestamp: time.Now().Unix(),
	}
	
	// Broadcast to all clients in the same website
	h.broadcastToWebsite(client.WebsiteID, responseMessage)
}

func (h *Hub) handleTypingStart(client *Client, message *Message) {
	// Broadcast typing indicator to other clients
	typingMessage := &Message{
		Type:      "user_typing",
		Data:      map[string]interface{}{"session_id": client.SessionID},
		Timestamp: time.Now().Unix(),
	}
	h.broadcastToWebsiteExcept(client.WebsiteID, client, typingMessage)
}

func (h *Hub) handleTypingStop(client *Client, message *Message) {
	// Broadcast typing stop to other clients
	typingMessage := &Message{
		Type:      "user_stopped_typing",
		Data:      map[string]interface{}{"session_id": client.SessionID},
		Timestamp: time.Now().Unix(),
	}
	h.broadcastToWebsiteExcept(client.WebsiteID, client, typingMessage)
}

func (h *Hub) handleJoinChat(client *Client, message *Message) {
	log.Printf("Client %s joined chat for website %d", client.SessionID, client.WebsiteID)
	
	// TODO: Use ChatService to create or get chat and load history
	// For now, send empty history
	client.SendMessage("chat_history", map[string]interface{}{
		"messages": []interface{}{},
		"chat_id":  nil, // TODO: Get actual chat ID
	})
	
	// Send welcome message
	client.SendMessage("bot_message", map[string]interface{}{
		"content":   "Hello! How can I help you today?",
		"timestamp": time.Now().Unix(),
		"sender":    "bot",
	})
}

func (h *Hub) handleLeaveChat(client *Client, message *Message) {
	log.Printf("Client %s left chat for website %d", client.SessionID, client.WebsiteID)
}

func (h *Hub) handlePing(client *Client, message *Message) {
	// Respond with pong
	client.SendMessage("pong", map[string]interface{}{
		"timestamp": time.Now().Unix(),
	})
}

// BroadcastToSession sends a message to a specific session
func (h *Hub) BroadcastToSession(sessionID string, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, websiteClients := range h.clients {
		for client := range websiteClients {
			if client.SessionID == sessionID {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(websiteClients, client)
				}
				return
			}
		}
	}
}

// broadcastToWebsite sends a message to all clients of a website
func (h *Hub) broadcastToWebsite(websiteID uint, message *Message) {
	if websiteClients, ok := h.clients[websiteID]; ok {
		messageBytes, _ := json.Marshal(message)
		for client := range websiteClients {
			select {
			case client.send <- messageBytes:
			default:
				close(client.send)
				delete(websiteClients, client)
			}
		}
	}
}

// broadcastToWebsiteExcept sends a message to all clients of a website except one
func (h *Hub) broadcastToWebsiteExcept(websiteID uint, exceptClient *Client, message *Message) {
	if websiteClients, ok := h.clients[websiteID]; ok {
		messageBytes, _ := json.Marshal(message)
		for client := range websiteClients {
			if client != exceptClient {
				select {
				case client.send <- messageBytes:
				default:
					close(client.send)
					delete(websiteClients, client)
				}
			}
		}
	}
}

// GetClientCount returns the number of connected clients
func (h *Hub) GetClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	
	total := 0
	for _, websiteClients := range h.clients {
		total += len(websiteClients)
	}
	return total
}

// GetWebsiteClientCount returns the number of connected clients for a website
func (h *Hub) GetWebsiteClientCount(websiteID uint) int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	
	if websiteClients, ok := h.clients[websiteID]; ok {
		return len(websiteClients)
	}
	return 0
}

// ServeWS handles websocket requests from the peer
func ServeWS(hub *Hub, w http.ResponseWriter, r *http.Request, sessionID string, websiteID uint) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}

	client := &Client{
		hub:         hub,
		conn:        conn,
		send:        make(chan []byte, 256),
		SessionID:   sessionID,
		WebsiteID:   websiteID,
		UserAgent:   r.UserAgent(),
		IP:          getClientIP(r),
		Language:    r.Header.Get("Accept-Language"),
		ConnectedAt: time.Now(),
		isActive:    true,
	}

	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in new goroutines
	go client.writePump()
	go client.readPump()
}

// readPump pumps messages from the websocket connection to the hub
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, messageBytes, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Handle incoming message
		var msg Message
		if err := json.Unmarshal(messageBytes, &msg); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		// Add metadata to message
		msg.SessionID = c.SessionID
		msg.WebsiteID = c.WebsiteID
		msg.Timestamp = time.Now().Unix()
		msg.Client = c

		// Send to hub for processing
		c.hub.broadcast <- &msg
	}
}

// writePump pumps messages from the hub to the websocket connection
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// IsActive returns whether the client is active
func (c *Client) IsActive() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.isActive
}

// SetActive sets the client's active status
func (c *Client) SetActive(active bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.isActive = active
}

// SendMessage sends a message to the client
func (c *Client) SendMessage(msgType string, data interface{}) error {
	msg := Message{
		Type:      msgType,
		Data:      data,
		Timestamp: getCurrentTimestamp(),
	}

	message, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	select {
	case c.send <- message:
	default:
		close(c.send)
		return err
	}

	return nil
}

// Helper functions
func getClientIP(r *http.Request) string {
	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip = r.Header.Get("X-Real-IP")
	}
	if ip == "" {
		ip = r.RemoteAddr
	}
	return ip
}

func getCurrentTimestamp() int64 {
	return time.Now().Unix()
}