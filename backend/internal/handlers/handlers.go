package handlers

import (
	"net/http"
	"strconv"

	"chatelly-backend/internal/database"
	"chatelly-backend/internal/models"
	"chatelly-backend/pkg/websocket"

	"github.com/gin-gonic/gin"
)

// Auth handlers
func Register(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Register endpoint - TODO"})
}

func Login(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Login endpoint - TODO"})
}

func RefreshToken(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Refresh token endpoint - TODO"})
}

// User handlers
func GetProfile(c *gin.Context) {
	userID := c.GetFloat64("user_id")
	var user models.User

	if err := database.DB.First(&user, uint(userID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func UpdateProfile(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Update profile endpoint - TODO"})
}

// Website handlers
func GetWebsites(c *gin.Context) {
	userID := c.GetFloat64("user_id")
	var websites []models.Website

	if err := database.DB.Where("user_id = ?", uint(userID)).Find(&websites).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch websites"})
		return
	}

	c.JSON(http.StatusOK, websites)
}

func CreateWebsite(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Create website endpoint - TODO"})
}

func GetWebsite(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid website ID"})
		return
	}

	userID := c.GetFloat64("user_id")
	var website models.Website

	if err := database.DB.Where("id = ? AND user_id = ?", uint(id), uint(userID)).First(&website).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website not found"})
		return
	}

	c.JSON(http.StatusOK, website)
}

func UpdateWebsite(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Update website endpoint - TODO"})
}

func DeleteWebsite(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Delete website endpoint - TODO"})
}

// Chat handlers
func GetChats(c *gin.Context) {
	websiteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid website ID"})
		return
	}

	userID := c.GetFloat64("user_id")

	// Verify website ownership
	var website models.Website
	if err := database.DB.Where("id = ? AND user_id = ?", uint(websiteID), uint(userID)).First(&website).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website not found"})
		return
	}

	var chats []models.Chat
	if err := database.DB.Where("website_id = ?", uint(websiteID)).Find(&chats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch chats"})
		return
	}

	c.JSON(http.StatusOK, chats)
}

func GetMessages(c *gin.Context) {
	chatID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
		return
	}

	userID := c.GetFloat64("user_id")

	// Verify chat ownership through website
	var chat models.Chat
	if err := database.DB.Preload("Website").Where("id = ?", uint(chatID)).First(&chat).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat not found"})
		return
	}

	if chat.Website.UserID != uint(userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var messages []models.Message
	if err := database.DB.Where("chat_id = ?", uint(chatID)).Order("created_at ASC").Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	c.JSON(http.StatusOK, messages)
}

// Subscription handlers
func GetSubscription(c *gin.Context) {
	userID := c.GetFloat64("user_id")
	var subscription models.Subscription

	if err := database.DB.Where("user_id = ? AND status = ?", uint(userID), "active").First(&subscription).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No active subscription found"})
		return
	}

	c.JSON(http.StatusOK, subscription)
}

func CreateSubscription(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Create subscription endpoint - TODO"})
}

func UpdateSubscription(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Update subscription endpoint - TODO"})
}

// Widget handlers
func HandleWebSocket(hub *websocket.Hub, c *gin.Context) {
	widgetKey := c.Param("widget_key")
	sessionID := c.Query("session_id")

	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID required"})
		return
	}

	// TODO: Validate widget key and get website ID
	var website models.Website
	if err := database.DB.Where("widget_key = ?", widgetKey).First(&website).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid widget key"})
		return
	}

	websocket.ServeWS(hub, c.Writer, c.Request, sessionID, website.ID)
}

func GetWidgetConfig(c *gin.Context) {
	widgetKey := c.Param("widget_key")

	var website models.Website
	if err := database.DB.Where("widget_key = ?", widgetKey).First(&website).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid widget key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"settings": website.Settings,
		"website": gin.H{
			"name":   website.Name,
			"domain": website.Domain,
		},
	})
}

func GetWidgetScript(c *gin.Context) {
	widgetKey := c.Param("widget_key")

	// TODO: Generate and return widget JavaScript
	script := `
		(function() {
			const widgetKey = '` + widgetKey + `';
			// Widget initialization code will go here
			console.log('Chatelly widget loaded with key:', widgetKey);
		})();
	`

	c.Header("Content-Type", "application/javascript")
	c.String(http.StatusOK, script)
}