package handlers

import (
	"net/http"
	"strconv"

	"chatelly-backend/internal/config"
	"chatelly-backend/internal/database"
	"chatelly-backend/internal/models"
	"chatelly-backend/internal/services"

	"github.com/gin-gonic/gin"
)

// WebsiteHandlers contains website-related handlers
type WebsiteHandlers struct {
	websiteService *services.WebsiteService
}

// NewWebsiteHandlers creates new WebsiteHandlers
func NewWebsiteHandlers(cfg *config.Config) *WebsiteHandlers {
	websiteService := services.NewWebsiteService(database.DB, cfg)
	return &WebsiteHandlers{
		websiteService: websiteService,
	}
}

// PaginationQuery represents pagination query parameters
type PaginationQuery struct {
	Page  int `form:"page,default=1" binding:"min=1"`
	Limit int `form:"limit,default=10" binding:"min=1,max=100"`
}

// SearchQuery represents search query parameters
type SearchQuery struct {
	Query string `form:"q"`
	PaginationQuery
}

// WebsiteStatsResponse represents website statistics response
type WebsiteStatsResponse struct {
	TotalChats    int64 `json:"total_chats"`
	ActiveChats   int64 `json:"active_chats"`
	TotalMessages int64 `json:"total_messages"`
	RecentChats   int64 `json:"recent_chats"`
}

// PaginatedResponse represents a paginated response
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
	Total      int64       `json:"total"`
	TotalPages int         `json:"total_pages"`
}

// CreateWebsite handles website creation
func (h *WebsiteHandlers) CreateWebsite(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.WebsiteCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"details": err.Error(),
		})
		return
	}

	// Create website
	website, err := h.websiteService.CreateWebsite(userID.(uint), &req)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "website limit reached for your current plan" {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Website created successfully",
		"website": website.ToResponse(),
	})
}

// GetWebsites handles listing websites with pagination
func (h *WebsiteHandlers) GetWebsites(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
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

	// Get websites
	websites, total, err := h.websiteService.GetWebsitesByUserID(userID.(uint), query.Page, query.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response format
	websiteResponses := make([]models.WebsiteResponse, len(websites))
	for i, website := range websites {
		websiteResponses[i] = website.ToResponse()
	}

	// Calculate total pages
	totalPages := int(total) / query.Limit
	if int(total)%query.Limit > 0 {
		totalPages++
	}

	response := PaginatedResponse{
		Data:       websiteResponses,
		Page:       query.Page,
		Limit:      query.Limit,
		Total:      total,
		TotalPages: totalPages,
	}

	c.JSON(http.StatusOK, response)
}

// GetWebsite handles getting a single website
func (h *WebsiteHandlers) GetWebsite(c *gin.Context) {
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

	// Get website
	website, err := h.websiteService.GetWebsiteByID(uint(websiteID), userID.(uint))
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "website not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"website": website.ToResponse(),
	})
}

// UpdateWebsite handles website updates
func (h *WebsiteHandlers) UpdateWebsite(c *gin.Context) {
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

	var req models.WebsiteUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"details": err.Error(),
		})
		return
	}

	// Update website
	website, err := h.websiteService.UpdateWebsite(uint(websiteID), userID.(uint), &req)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "website not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Website updated successfully",
		"website": website.ToResponse(),
	})
}

// DeleteWebsite handles website deletion
func (h *WebsiteHandlers) DeleteWebsite(c *gin.Context) {
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

	// Delete website
	err = h.websiteService.DeleteWebsite(uint(websiteID), userID.(uint))
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "website not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Website deleted successfully",
	})
}

// UpdateWebsiteSettings handles website settings updates
func (h *WebsiteHandlers) UpdateWebsiteSettings(c *gin.Context) {
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

	var settings models.WebsiteSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"details": err.Error(),
		})
		return
	}

	// Update settings
	website, err := h.websiteService.UpdateWebsiteSettings(uint(websiteID), userID.(uint), settings)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "website not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Website settings updated successfully",
		"website": website.ToResponse(),
	})
}

// ToggleWebsiteStatus handles toggling website active status
func (h *WebsiteHandlers) ToggleWebsiteStatus(c *gin.Context) {
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

	// Toggle status
	website, err := h.websiteService.ToggleWebsiteStatus(uint(websiteID), userID.(uint))
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "website not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Website status updated successfully",
		"website": website.ToResponse(),
	})
}

// GetWebsiteStats handles getting website statistics
func (h *WebsiteHandlers) GetWebsiteStats(c *gin.Context) {
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

	// Get stats
	stats, err := h.websiteService.GetWebsiteStats(uint(websiteID), userID.(uint))
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "website not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
	})
}

// GetWebsiteAnalytics handles getting website analytics
func (h *WebsiteHandlers) GetWebsiteAnalytics(c *gin.Context) {
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

	// Get days parameter (default 30)
	days := 30
	if daysParam := c.Query("days"); daysParam != "" {
		if parsedDays, err := strconv.Atoi(daysParam); err == nil && parsedDays > 0 {
			days = parsedDays
		}
	}

	// Get analytics
	analytics, err := h.websiteService.GetWebsiteAnalytics(uint(websiteID), userID.(uint), days)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "website not found or access denied" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"analytics": analytics,
	})
}

// RegenerateWidgetKey handles regenerating widget key
func (h *WebsiteHandlers) RegenerateWidgetKey(c *gin.Context) {
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

	// Regenerate widget key
	website, err := h.websiteService.RegenerateWidgetKey(uint(websiteID), userID.(uint))
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "website not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Widget key regenerated successfully",
		"widget_key": website.WidgetKey,
	})
}

// SearchWebsites handles searching websites
func (h *WebsiteHandlers) SearchWebsites(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var query SearchQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid query parameters",
			"details": err.Error(),
		})
		return
	}

	// Search websites
	websites, total, err := h.websiteService.SearchWebsites(userID.(uint), query.Query, query.Page, query.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response format
	websiteResponses := make([]models.WebsiteResponse, len(websites))
	for i, website := range websites {
		websiteResponses[i] = website.ToResponse()
	}

	// Calculate total pages
	totalPages := int(total) / query.Limit
	if int(total)%query.Limit > 0 {
		totalPages++
	}

	response := PaginatedResponse{
		Data:       websiteResponses,
		Page:       query.Page,
		Limit:      query.Limit,
		Total:      total,
		TotalPages: totalPages,
	}

	c.JSON(http.StatusOK, response)
}