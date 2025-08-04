package services

import (
	"errors"
	"fmt"
	"strings"

	"chatelly-backend/internal/config"
	"chatelly-backend/internal/models"

	"gorm.io/gorm"
)

// WidgetService handles widget business logic
type WidgetService struct {
	db  *gorm.DB
	cfg *config.Config
}

// NewWidgetService creates a new WidgetService
func NewWidgetService(db *gorm.DB, cfg *config.Config) *WidgetService {
	return &WidgetService{
		db:  db,
		cfg: cfg,
	}
}

// WidgetTheme represents available widget themes
type WidgetTheme struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Preview     string `json:"preview"`
}

// WidgetPosition represents available widget positions
type WidgetPosition struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

// GetAvailableThemes returns all available widget themes
func (s *WidgetService) GetAvailableThemes() []WidgetTheme {
	return []WidgetTheme{
		{
			ID:          "modern",
			Name:        "Modern",
			Description: "Clean and modern design with rounded corners",
			Preview:     "/themes/modern-preview.png",
		},
		{
			ID:          "classic",
			Name:        "Classic",
			Description: "Traditional chat widget design",
			Preview:     "/themes/classic-preview.png",
		},
		{
			ID:          "minimal",
			Name:        "Minimal",
			Description: "Minimalist design with clean lines",
			Preview:     "/themes/minimal-preview.png",
		},
		{
			ID:          "rounded",
			Name:        "Rounded",
			Description: "Fully rounded design for friendly appearance",
			Preview:     "/themes/rounded-preview.png",
		},
		{
			ID:          "dark",
			Name:        "Dark",
			Description: "Dark theme for modern websites",
			Preview:     "/themes/dark-preview.png",
		},
	}
}

// GetAvailablePositions returns all available widget positions
func (s *WidgetService) GetAvailablePositions() []WidgetPosition {
	return []WidgetPosition{
		{
			ID:          "bottom-right",
			Name:        "Bottom Right",
			Description: "Bottom right corner of the page",
		},
		{
			ID:          "bottom-left",
			Name:        "Bottom Left",
			Description: "Bottom left corner of the page",
		},
		{
			ID:          "top-right",
			Name:        "Top Right",
			Description: "Top right corner of the page",
		},
		{
			ID:          "top-left",
			Name:        "Top Left",
			Description: "Top left corner of the page",
		},
		{
			ID:          "center-right",
			Name:        "Center Right",
			Description: "Center right side of the page",
		},
		{
			ID:          "center-left",
			Name:        "Center Left",
			Description: "Center left side of the page",
		},
	}
}

// ValidateWidgetSettings validates widget settings
func (s *WidgetService) ValidateWidgetSettings(settings models.WebsiteSettings) error {
	// Validate theme
	validThemes := s.GetAvailableThemes()
	themeValid := false
	for _, theme := range validThemes {
		if theme.ID == settings.Theme {
			themeValid = true
			break
		}
	}
	if !themeValid {
		return errors.New("invalid theme selected")
	}

	// Validate position
	validPositions := s.GetAvailablePositions()
	positionValid := false
	for _, position := range validPositions {
		if position.ID == settings.Position {
			positionValid = true
			break
		}
	}
	if !positionValid {
		return errors.New("invalid position selected")
	}

	// Validate primary color (hex color)
	if settings.PrimaryColor != "" {
		if !isValidHexColor(settings.PrimaryColor) {
			return errors.New("invalid primary color format (use hex format like #FF0000)")
		}
	}

	// Validate language code
	if settings.Language != "" {
		if !isValidLanguageCode(settings.Language) {
			return errors.New("invalid language code")
		}
	}

	// Validate messages length
	if len(settings.WelcomeMessage) > 500 {
		return errors.New("welcome message too long (max 500 characters)")
	}
	if len(settings.OfflineMessage) > 500 {
		return errors.New("offline message too long (max 500 characters)")
	}

	// Validate custom CSS length
	if len(settings.CustomCSS) > 10000 {
		return errors.New("custom CSS too long (max 10000 characters)")
	}

	// Validate allowed domains
	for _, domain := range settings.AllowedDomains {
		if err := models.ValidateDomain(domain); err != nil {
			return fmt.Errorf("invalid allowed domain '%s': %w", domain, err)
		}
	}

	return nil
}

// GetWidgetConfig retrieves widget configuration by widget key
func (s *WidgetService) GetWidgetConfig(widgetKey string) (*models.Website, error) {
	// Validate widget key format
	if err := models.ValidateWidgetKey(widgetKey); err != nil {
		return nil, fmt.Errorf("invalid widget key: %w", err)
	}

	// Get website by widget key
	website, err := models.GetWebsiteByWidgetKey(s.db, widgetKey)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("widget not found")
		}
		return nil, err
	}

	// Check if website is active
	if !website.IsActive {
		return nil, errors.New("widget is disabled")
	}

	return website, nil
}

// GenerateWidgetScript generates the JavaScript code for the widget
func (s *WidgetService) GenerateWidgetScript(widgetKey string) (string, error) {
	// Get widget configuration
	website, err := s.GetWidgetConfig(widgetKey)
	if err != nil {
		return "", err
	}

	// Generate script with configuration
	script := fmt.Sprintf(`
(function() {
    'use strict';
    
    // Widget configuration
    const WIDGET_CONFIG = {
        widgetKey: '%s',
        websiteId: %d,
        apiUrl: '%s',
        wsUrl: '%s',
        settings: %s
    };
    
    // Widget state
    let isOpen = false;
    let isConnected = false;
    let socket = null;
    let sessionId = null;
    
    // Generate session ID
    function generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    // Create widget HTML
    function createWidget() {
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'chatelly-widget';
        widgetContainer.innerHTML = ` + "`" + `
            <div id="chatelly-widget-button" class="chatelly-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 14.99 3.01 16.28L2 22L7.72 20.99C9.01 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="currentColor"/>
                </svg>
            </div>
            <div id="chatelly-widget-chat" class="chatelly-chat" style="display: none;">
                <div class="chatelly-header">
                    <h3>Chat with us</h3>
                    <button id="chatelly-close" class="chatelly-close">×</button>
                </div>
                <div class="chatelly-messages" id="chatelly-messages"></div>
                <div class="chatelly-input-container">
                    <input type="text" id="chatelly-input" placeholder="Type your message..." />
                    <button id="chatelly-send">Send</button>
                </div>
            </div>
        ` + "`" + `;
        
        // Apply styles
        const styles = document.createElement('style');
        styles.textContent = getCSSStyles();
        document.head.appendChild(styles);
        
        // Position widget
        widgetContainer.className = 'chatelly-widget-' + WIDGET_CONFIG.settings.position;
        
        document.body.appendChild(widgetContainer);
        
        // Add event listeners
        setupEventListeners();
    }
    
    // Get CSS styles based on configuration
    function getCSSStyles() {
        const settings = WIDGET_CONFIG.settings;
        return ` + "`" + `
            #chatelly-widget {
                position: fixed;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .chatelly-widget-bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .chatelly-widget-bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .chatelly-widget-top-right {
                top: 20px;
                right: 20px;
            }
            
            .chatelly-widget-top-left {
                top: 20px;
                left: 20px;
            }
            
            .chatelly-button {
                width: 60px;
                height: 60px;
                border-radius: 50%%;
                background-color: ${settings.primary_color};
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
            }
            
            .chatelly-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            }
            
            .chatelly-chat {
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.12);
                display: flex;
                flex-direction: column;
                position: absolute;
                bottom: 70px;
                right: 0;
            }
            
            .chatelly-header {
                background: ${settings.primary_color};
                color: white;
                padding: 16px;
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .chatelly-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .chatelly-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .chatelly-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .chatelly-message {
                max-width: 80%%;
                padding: 8px 12px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .chatelly-message.user {
                background: ${settings.primary_color};
                color: white;
                align-self: flex-end;
            }
            
            .chatelly-message.bot {
                background: #f1f3f5;
                color: #333;
                align-self: flex-start;
            }
            
            .chatelly-input-container {
                padding: 16px;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 8px;
            }
            
            #chatelly-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #dee2e6;
                border-radius: 20px;
                outline: none;
                font-size: 14px;
            }
            
            #chatelly-input:focus {
                border-color: ${settings.primary_color};
            }
            
            #chatelly-send {
                background: ${settings.primary_color};
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            }
            
            ${settings.custom_css || ''}
        ` + "`" + `;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        const button = document.getElementById('chatelly-widget-button');
        const chat = document.getElementById('chatelly-widget-chat');
        const closeBtn = document.getElementById('chatelly-close');
        const input = document.getElementById('chatelly-input');
        const sendBtn = document.getElementById('chatelly-send');
        
        button.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', closeChat);
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Toggle chat visibility
    function toggleChat() {
        const chat = document.getElementById('chatelly-widget-chat');
        isOpen = !isOpen;
        chat.style.display = isOpen ? 'flex' : 'none';
        
        if (isOpen && !isConnected) {
            connectWebSocket();
        }
    }
    
    // Close chat
    function closeChat() {
        const chat = document.getElementById('chatelly-widget-chat');
        isOpen = false;
        chat.style.display = 'none';
    }
    
    // Connect to WebSocket
    function connectWebSocket() {
        if (!sessionId) {
            sessionId = generateSessionId();
        }
        
        const wsUrl = WIDGET_CONFIG.wsUrl + '/' + WIDGET_CONFIG.widgetKey + '?session_id=' + sessionId;
        socket = new WebSocket(wsUrl);
        
        socket.onopen = function() {
            isConnected = true;
            console.log('Connected to chat');
            
            // Join chat
            socket.send(JSON.stringify({
                type: 'join_chat',
                data: {
                    session_id: sessionId
                }
            }));
        };
        
        socket.onmessage = function(event) {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
        };
        
        socket.onclose = function() {
            isConnected = false;
            console.log('Disconnected from chat');
        };
        
        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
    }
    
    // Handle WebSocket messages
    function handleWebSocketMessage(message) {
        switch (message.type) {
            case 'chat_history':
                loadChatHistory(message.data.messages);
                break;
            case 'message_received':
                addMessage(message.data.content, message.data.sender);
                break;
            case 'bot_message':
                addMessage(message.data.content, 'bot');
                break;
            case 'connection_established':
                console.log('Connection established');
                break;
        }
    }
    
    // Load chat history
    function loadChatHistory(messages) {
        const messagesContainer = document.getElementById('chatelly-messages');
        messagesContainer.innerHTML = '';
        
        messages.forEach(function(msg) {
            addMessage(msg.content, msg.sender, false);
        });
    }
    
    // Add message to chat
    function addMessage(content, sender, scroll = true) {
        const messagesContainer = document.getElementById('chatelly-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatelly-message ' + sender;
        messageDiv.textContent = content;
        
        messagesContainer.appendChild(messageDiv);
        
        if (scroll) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    // Send message
    function sendMessage() {
        const input = document.getElementById('chatelly-input');
        const message = input.value.trim();
        
        if (message && socket && isConnected) {
            // Add message to UI immediately
            addMessage(message, 'user');
            
            // Send to server
            socket.send(JSON.stringify({
                type: 'chat_message',
                data: {
                    content: message,
                    session_id: sessionId
                }
            }));
            
            input.value = '';
        }
    }
    
    // Initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
    
    // Add welcome message
    setTimeout(function() {
        if (WIDGET_CONFIG.settings.welcome_message) {
            addMessage(WIDGET_CONFIG.settings.welcome_message, 'bot');
        }
    }, 1000);
    
})();`,
		widgetKey,
		website.ID,
		s.getAPIURL(),
		s.getWebSocketURL(),
		s.settingsToJSON(website.Settings),
	)

	return script, nil
}

// getAPIURL returns the API base URL
func (s *WidgetService) getAPIURL() string {
	// TODO: Get from config
	return "http://localhost:8080/api/v1"
}

// getWebSocketURL returns the WebSocket base URL
func (s *WidgetService) getWebSocketURL() string {
	// TODO: Get from config
	return "ws://localhost:8080/widget/ws"
}

// settingsToJSON converts settings to JSON string
func (s *WidgetService) settingsToJSON(settings models.WebsiteSettings) string {
	// Simple JSON serialization for settings
	return fmt.Sprintf(`{
		"theme": "%s",
		"primary_color": "%s",
		"position": "%s",
		"welcome_message": "%s",
		"offline_message": "%s",
		"language": "%s",
		"translation_enabled": %t,
		"moderation_enabled": %t,
		"custom_css": "%s"
	}`,
		settings.Theme,
		settings.PrimaryColor,
		settings.Position,
		escapeJSON(settings.WelcomeMessage),
		escapeJSON(settings.OfflineMessage),
		settings.Language,
		settings.TranslationEnabled,
		settings.ModerationEnabled,
		escapeJSON(settings.CustomCSS),
	)
}

// Helper functions
func isValidHexColor(color string) bool {
	if len(color) != 7 || color[0] != '#' {
		return false
	}
	for i := 1; i < 7; i++ {
		c := color[i]
		if !((c >= '0' && c <= '9') || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f')) {
			return false
		}
	}
	return true
}

func isValidLanguageCode(lang string) bool {
	// Simple validation for common language codes
	validLangs := []string{"en", "tr", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar"}
	for _, validLang := range validLangs {
		if lang == validLang {
			return true
		}
	}
	return false
}

func escapeJSON(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "\"", "\\\"")
	s = strings.ReplaceAll(s, "\n", "\\n")
	s = strings.ReplaceAll(s, "\r", "\\r")
	s = strings.ReplaceAll(s, "\t", "\\t")
	return s
}