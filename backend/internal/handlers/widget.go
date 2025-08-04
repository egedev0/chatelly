package handlers

import (
	"net/http"

	"chatelly-backend/internal/config"
	"chatelly-backend/internal/database"
	"chatelly-backend/internal/models"
	"chatelly-backend/internal/services"
	"chatelly-backend/pkg/websocket"

	"github.com/gin-gonic/gin"
)

// WidgetHandlers contains widget-related handlers
type WidgetHandlers struct {
	widgetService  *services.WidgetService
	websiteService *services.WebsiteService
	chatService    *services.ChatService
}

// NewWidgetHandlers creates new WidgetHandlers
func NewWidgetHandlers(cfg *config.Config) *WidgetHandlers {
	widgetService := services.NewWidgetService(database.DB, cfg)
	websiteService := services.NewWebsiteService(database.DB, cfg)
	chatService := services.NewChatService(database.DB, cfg)
	return &WidgetHandlers{
		widgetService:  widgetService,
		websiteService: websiteService,
		chatService:    chatService,
	}
}

// GetWidgetConfig handles getting widget configuration (public endpoint)
func (h *WidgetHandlers) GetWidgetConfig(c *gin.Context) {
	widgetKey := c.Param("widget_key")
	if widgetKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Widget key is required"})
		return
	}

	// Get widget configuration
	website, err := h.widgetService.GetWidgetConfig(widgetKey)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "widget not found" || err.Error() == "widget is disabled" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	// Return configuration
	c.JSON(http.StatusOK, gin.H{
		"widget_key": website.WidgetKey,
		"website": gin.H{
			"id":     website.ID,
			"name":   website.Name,
			"domain": website.Domain,
		},
		"settings": website.Settings,
		"is_active": website.IsActive,
	})
}

// GetWidgetScript handles getting widget JavaScript (public endpoint)
func (h *WidgetHandlers) GetWidgetScript(c *gin.Context) {
	widgetKey := c.Param("widget_key")
	if widgetKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Widget key is required"})
		return
	}

	// Generate widget script
	script, err := h.widgetService.GenerateWidgetScript(widgetKey)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "widget not found" || err.Error() == "widget is disabled" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	// Set appropriate headers for JavaScript
	c.Header("Content-Type", "application/javascript; charset=utf-8")
	c.Header("Cache-Control", "public, max-age=3600") // Cache for 1 hour
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "GET")
	c.Header("Access-Control-Allow-Headers", "Content-Type")

	c.String(http.StatusOK, script)
}

// HandleWebSocket handles WebSocket connections for chat (public endpoint)
func (h *WidgetHandlers) HandleWebSocket(hub *websocket.Hub, c *gin.Context) {
	widgetKey := c.Param("widget_key")
	sessionID := c.Query("session_id")

	if widgetKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Widget key is required"})
		return
	}

	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID is required"})
		return
	}

	// Validate widget key and get website
	website, err := h.widgetService.GetWidgetConfig(widgetKey)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid widget key"})
		return
	}

	// Create or get chat session
	visitorIP := getClientIP(c.Request)
	userAgent := c.Request.UserAgent()
	language := c.Request.Header.Get("Accept-Language")
	if language == "" {
		language = "en"
	}

	chat, err := h.chatService.CreateOrGetChat(website.ID, sessionID, visitorIP, userAgent, language)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create chat session"})
		return
	}

	// Store chat ID in context for WebSocket handlers
	c.Set("chat_id", chat.ID)

	// Serve WebSocket connection
	websocket.ServeWS(hub, c.Writer, c.Request, sessionID, website.ID)
}

// GetAvailableThemes handles getting available widget themes (protected endpoint)
func (h *WidgetHandlers) GetAvailableThemes(c *gin.Context) {
	themes := h.widgetService.GetAvailableThemes()
	c.JSON(http.StatusOK, gin.H{
		"themes": themes,
	})
}

// GetAvailablePositions handles getting available widget positions (protected endpoint)
func (h *WidgetHandlers) GetAvailablePositions(c *gin.Context) {
	positions := h.widgetService.GetAvailablePositions()
	c.JSON(http.StatusOK, gin.H{
		"positions": positions,
	})
}

// ValidateWidgetSettings handles validating widget settings (protected endpoint)
func (h *WidgetHandlers) ValidateWidgetSettings(c *gin.Context) {
	var settings struct {
		Theme              string            `json:"theme" binding:"required"`
		PrimaryColor       string            `json:"primary_color" binding:"required"`
		Position           string            `json:"position" binding:"required"`
		WelcomeMessage     string            `json:"welcome_message"`
		OfflineMessage     string            `json:"offline_message"`
		Language           string            `json:"language"`
		TranslationEnabled bool              `json:"translation_enabled"`
		ModerationEnabled  bool              `json:"moderation_enabled"`
		CustomCSS          string            `json:"custom_css"`
		AllowedDomains     []string          `json:"allowed_domains"`
		BusinessHours      map[string]string `json:"business_hours"`
	}

	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"details": err.Error(),
		})
		return
	}

	// Convert to WebsiteSettings
	websiteSettings := models.WebsiteSettings{
		Theme:              settings.Theme,
		PrimaryColor:       settings.PrimaryColor,
		Position:           settings.Position,
		WelcomeMessage:     settings.WelcomeMessage,
		OfflineMessage:     settings.OfflineMessage,
		Language:           settings.Language,
		TranslationEnabled: settings.TranslationEnabled,
		ModerationEnabled:  settings.ModerationEnabled,
		CustomCSS:          settings.CustomCSS,
		AllowedDomains:     settings.AllowedDomains,
		BusinessHours:      settings.BusinessHours,
	}

	// Validate settings
	if err := h.widgetService.ValidateWidgetSettings(websiteSettings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Settings are valid",
		"settings": websiteSettings,
	})
}

// PreviewWidget handles generating widget preview (protected endpoint)
func (h *WidgetHandlers) PreviewWidget(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req struct {
		WebsiteID uint `json:"website_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"details": err.Error(),
		})
		return
	}

	// Validate website ownership
	if err := h.websiteService.ValidateWebsiteOwnership(req.WebsiteID, userID.(uint)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Get website
	website, err := h.websiteService.GetWebsiteByID(req.WebsiteID, userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Generate preview HTML
	previewHTML := h.generatePreviewHTML(website)

	c.Header("Content-Type", "text/html; charset=utf-8")
	c.String(http.StatusOK, previewHTML)
}

// generatePreviewHTML generates HTML for widget preview
func (h *WidgetHandlers) generatePreviewHTML(website *models.Website) string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widget Preview - ` + website.Name + `</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8f9fa;
        }
        .preview-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .preview-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .preview-content {
            height: 400px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            position: relative;
            overflow: hidden;
        }
        .preview-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            text-align: center;
        }
        .preview-text h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .preview-text p {
            margin: 0;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="preview-header">
            <h1>Widget Preview</h1>
            <p>This is how your chat widget will appear on your website</p>
        </div>
        <div class="preview-content">
            <div class="preview-text">
                <h2>Your Website Content</h2>
                <p>The chat widget will appear in the ` + website.Settings.Position + ` corner</p>
            </div>
        </div>
    </div>
    
    <!-- Widget Script -->
    <script src="/widget/script/` + website.WidgetKey + `"></script>
</body>
</html>`
}

// Helper function to get client IP
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