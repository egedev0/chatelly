package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// TODO: Implement proper origin checking based on website settings
		return true
	},
}

// Hub maintains the set of active clients and broadcasts messages to the clients
type Hub struct {
	// Registered clients
	clients map[*Client]bool

	// Inbound messages from the clients
	broadcast chan []byte

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Mutex for thread safety
	mu sync.RWMutex
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
}

// Message represents a websocket message
type Message struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	SessionID string      `json:"session_id,omitempty"`
	Timestamp int64       `json:"timestamp"`
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
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

// Run starts the hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("Client registered: %s", client.SessionID)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			log.Printf("Client unregistered: %s", client.SessionID)

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// BroadcastToSession sends a message to a specific session
func (h *Hub) BroadcastToSession(sessionID string, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		if client.SessionID == sessionID {
			select {
			case client.send <- message:
			default:
				close(client.send)
				delete(h.clients, client)
			}
		}
	}
}

// GetClientCount returns the number of connected clients
func (h *Hub) GetClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// ServeWS handles websocket requests from the peer
func ServeWS(hub *Hub, w http.ResponseWriter, r *http.Request, sessionID string, websiteID uint) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}

	client := &Client{
		hub:       hub,
		conn:      conn,
		send:      make(chan []byte, 256),
		SessionID: sessionID,
		WebsiteID: websiteID,
		UserAgent: r.UserAgent(),
		IP:        getClientIP(r),
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

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Handle incoming message
		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		// Add session ID to message
		msg.SessionID = c.SessionID

		// Process message based on type
		c.handleMessage(&msg)
	}
}

// writePump pumps messages from the hub to the websocket connection
func (c *Client) writePump() {
	defer c.conn.Close()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		}
	}
}

// handleMessage processes incoming messages
func (c *Client) handleMessage(msg *Message) {
	// TODO: Implement message handling logic
	// This will include:
	// - Saving messages to database
	// - Processing with AI
	// - Translation if needed
	// - Moderation checks
	// - Broadcasting responses

	log.Printf("Received message from %s: %+v", c.SessionID, msg)
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
	return 0 // TODO: Implement proper timestamp
}