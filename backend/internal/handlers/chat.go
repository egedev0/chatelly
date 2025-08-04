package handlers

import (
	"net/http"
	"strconv"
	"time"

	"chatelly-backend/internal/config"
	"chatelly-backend/internal/database"
	"chatelly-backend/internal/services"

	"github.com/gin-gonic/gin"
)

// ChatHandlers contains chat-related handlers
type ChatHandlers struct {
	chatService    *services.ChatService
	websiteService *services.WebsiteService
}

// NewChatHandlers creates new ChatHandlers
func NewChatHandlers(cfg *config.Config) *ChatHandlers {
	chatService := services.NewChatService(database.DB, cfg)
	websiteService := services.NewWebsiteService(database.DB, cfg)
	return &ChatHandlers{
		chatService:    chatService,
		websiteService: websiteService,
	}
}

// ChatStatsQuery represents chat statistics query parameters
type ChatStatsQuery struct {
	Days int `form:"days,default=30" binding:"min=1,max=365"`
}

// ChatAnalyticsQuery represents chat analytics query parameters
type ChatAnalyticsQuery struct {
	StartDate string `form:"start_date" binding:"required"`
	EndDate   string `form:"end_date" binding:"required"`
}

// SearchChatsQuery represents search chats query parameters
type SearchChatsQuery struct {
	Query  string `form:"q"`
	Status string `form:"status" binding:"omitempty,oneof=active ended"`
	PaginationQuery
}

// GetChats handles getting chats for a website
func (h *ChatHandlers) GetChats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	websiteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid website ID"})
		return
	}

	// Validate website ownership
	if err := h.websiteService.ValidateWebsiteOwnership(uint(websiteID), userID.(uint)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	var query PaginationQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid query parameters",
			"details": err.Error(),
		})
		return
	}

	// Get chats
	chats, total, err := h.chatService.GetChatsByWebsiteID(uint(websiteID), query.Page, query.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Calculate total pages
	totalPages := int(total) / query.Limit
	if int(total)%query.Limit > 0 {
		totalPages++
	}

	response := PaginatedResponse{
		Data:       chats,
		Page:       query.Page,
		Limit:      query.Limit,
		Total:      total,
		TotalPages: totalPages,
	}

	c.JSON(http.StatusOK, response)
}

// GetChat handles getting a single chat
func (h *ChatHandlers) GetChat(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	chatID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
		return
	}

	// Validate chat access
	if err := h.chatService.ValidateChatAccess(uint(chatID), userID.(uint)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Get chat
	chat, err := h.chatService.GetChatByID(uint(chatID))
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "chat not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"chat": chat,
	})
}

// GetMessages handles getting messages for a chat
func (h *ChatHandlers) GetMessages(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	chatID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
		return
	}

	// Validate chat access
	if err := h.chatService.ValidateChatAccess(uint(chatID), userID.(uint)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	var query PaginationQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid query parameters",
			"details": err.Error(),
		})
		return
	}

	// Get messages
	messages, total, err := h.chatService.GetMessagesByChatID(uint(chatID), query.Page, query.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Calculate total pages
	totalPages := int(total) / query.Limit
	if int(total)%query.Limit > 0 {
		totalPages++
	}

	response := PaginatedResponse{
		Data:       messages,
		Page:       query.Page,
		Limit:      query.Limit,
		Total:      total,
		TotalPages: totalPages,
	}

	c.JSON(http.StatusOK, response)
}

// EndChat handles ending a chat session
func (h *ChatHandlers) EndChat(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	chatID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
		return
	}

	// Validate chat access
	if err := h.chatService.ValidateChatAccess(uint(chatID), userID.(uint)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// End chat
	if err := h.chatService.EndChat(uint(chatID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Chat ended successfully",
	})
}

// GetChatStats handles getting chat statistics
func (h *ChatHandlers) GetChatStats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	websiteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid website ID"})
		return
	}

	// Validate website ownership
	if err := h.websiteService.ValidateWebsiteOwnership(uint(websiteID), userID.(uint)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	var query ChatStatsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid query parameters",
			"details": err.Error(),
		})
		return
	}

	// Get stats
	stats, err := h.chatService.GetChatStats(uint(websiteID), query.Days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
	})
}

// GetChatAnalytics handles getting chat analytics
func (h *ChatHandlers) GetChatAnalytics(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	websiteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid website ID"})
		return
	}

	// Validate website ownership
	if err := h.websiteService.ValidateWebsiteOwnership(uint(websiteID), userID.(uint)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	var query ChatAnalyticsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid query parameters",
			"details": err.Error(),
		})
		return
	}

	// Parse dates
	startDate, err := time.Parse("2006-01-02", query.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format (YYYY-MM-DD)"})
		return
	}

	endDate, err := time.Parse("2006-01-02", query.EndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format (YYYY-MM-DD)"})
		return
	}

	// Get analytics
	analytics, err := h.chatService.GetChatAnalytics(uint(websiteID), startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"analytics": analytics,
	})
}

// SearchChats handles searching chats
func (h *ChatHandlers) SearchChats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	websiteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid website ID"})
		return
	}

	// Validate website ownership
	if err := h.websiteService.ValidateWebsiteOwnership(uint(websiteID), userID.(uint)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	var query SearchChatsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid query parameters",
			"details": err.Error(),
		})
		return
	}

	// Search chats
	chats, total, err := h.chatService.SearchChats(uint(websiteID), query.Query, query.Status, query.Page, query.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Calculate total pages
	totalPages := int(total) / query.Limit
	if int(total)%query.Limit > 0 {
		totalPages++
	}

	response := PaginatedResponse{
		Data:       chats,
		Page:       query.Page,
		Limit:      query.Limit,
		Total:      total,
		TotalPages: totalPages,
	}

	c.JSON(http.StatusOK, response)
}

// FlagMessage handles flagging a message for moderation
func (h *ChatHandlers) FlagMessage(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	messageID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message ID"})
		return
	}

	// TODO: Validate message access through chat ownership

	var req struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"details": err.Error(),
		})
		return
	}

	// Flag message
	if err := h.chatService.FlagMessage(uint(messageID), req.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Message flagged successfully",
	})
}

// GetActiveChats handles getting active chats for a website
func (h *ChatHandlers) GetActiveChats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	websiteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid website ID"})
		return
	}

	// Validate website ownership
	if err := h.websiteService.ValidateWebsiteOwnership(uint(websiteID), userID.(uint)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Get active chats
	chats, err := h.chatService.GetActiveChatsByWebsite(uint(websiteID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"chats": chats,
	})
}