package handlers

import (
	"net/http"
	"strconv"
	"time"

	"chatelly-backend/internal/config"
	"chatelly-backend/internal/database"
	"chatelly-backend/internal/models"
	"chatelly-backend/internal/services"

	"github.com/gin-gonic/gin"
)

// AnalyticsHandlers contains analytics-related handlers
type AnalyticsHandlers struct {
	analyticsService *services.AnalyticsService
	websiteService   *services.WebsiteService
}

// NewAnalyticsHandlers creates new AnalyticsHandlers
func NewAnalyticsHandlers(cfg *config.Config) *AnalyticsHandlers {
	analyticsService := services.NewAnalyticsService(database.DB, cfg)
	websiteService := services.NewWebsiteService(database.DB, cfg)
	return &AnalyticsHandlers{
		analyticsService: analyticsService,
		websiteService:   websiteService,
	}
}

// DashboardMetricsQuery represents dashboard metrics query parameters
type DashboardMetricsQuery struct {
	Days int `form:"days,default=30" binding:"min=1,max=365"`
}

// AnalyticsQuery represents analytics query parameters
type AnalyticsQuery struct {
	StartDate string `form:"start_date" binding:"required"`
	EndDate   string `form:"end_date" binding:"required"`
}

// EventsQuery represents events query parameters
type EventsQuery struct {
	EventType string `form:"event_type" binding:"required"`
	StartDate string `form:"start_date" binding:"required"`
	EndDate   string `form:"end_date" binding:"required"`
	PaginationQuery
}

// TrackEventRequest represents event tracking request
type TrackEventRequest struct {
	EventType string                 `json:"event_type" binding:"required"`
	EventData map[string]interface{} `json:"event_data"`
	VisitorID string                 `json:"visitor_id"`
	SessionID string                 `json:"session_id"`
}

// GetDashboardMetrics handles getting dashboard metrics
func (h *AnalyticsHandlers) GetDashboardMetrics(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var query DashboardMetricsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid query parameters",
			"details": err.Error(),
		})
		return
	}

	// Get all websites for the user
	websites, _, err := h.websiteService.GetWebsitesByUserID(userID.(uint), 1, 1000)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(websites) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"metrics": models.DashboardMetrics{},
		})
		return
	}

	// For now, get metrics for the first website
	// TODO: Aggregate metrics across all websites
	metrics, err := h.analyticsService.GetDashboardMetrics(websites[0].ID, query.Days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"metrics": metrics,
	})
}

// GetWebsiteAnalytics handles getting website-specific analytics
func (h *AnalyticsHandlers) GetWebsiteAnalytics(c *gin.Context) {
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

	var query AnalyticsQuery
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
	analytics, err := h.analyticsService.GetWebsiteAnalytics(uint(websiteID), startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"analytics": analytics,
	})
}

// GetEventsByType handles getting events filtered by type
func (h *AnalyticsHandlers) GetEventsByType(c *gin.Context) {
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

	var query EventsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid query parameters",
			"details": err.Error(),
		})
		return
	}

	// Validate event type
	if !models.IsValidEventType(query.EventType) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event type"})
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

	// Get events
	events, total, err := h.analyticsService.GetEventsByType(uint(websiteID), query.EventType, startDate, endDate, query.Page, query.Limit)
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
		Data:       events,
		Page:       query.Page,
		Limit:      query.Limit,
		Total:      total,
		TotalPages: totalPages,
	}

	c.JSON(http.StatusOK, response)
}

// GetVisitorJourney handles getting visitor journey
func (h *AnalyticsHandlers) GetVisitorJourney(c *gin.Context) {
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

	visitorID := c.Param("visitor_id")
	if visitorID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Visitor ID is required"})
		return
	}

	// Validate website ownership
	if err := h.websiteService.ValidateWebsiteOwnership(uint(websiteID), userID.(uint)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	var query AnalyticsQuery
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

	// Get visitor journey
	journey, err := h.analyticsService.GetVisitorJourney(uint(websiteID), visitorID, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"journey": journey,
	})
}

// GetRealTimeMetrics handles getting real-time metrics
func (h *AnalyticsHandlers) GetRealTimeMetrics(c *gin.Context) {
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

	// Get real-time metrics
	metrics, err := h.analyticsService.GetRealTimeMetrics(uint(websiteID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"metrics": metrics,
	})
}

// TrackEvent handles event tracking (public endpoint for widgets)
func (h *AnalyticsHandlers) TrackEvent(c *gin.Context) {
	widgetKey := c.Param("widget_key")
	if widgetKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Widget key is required"})
		return
	}

	var req TrackEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"details": err.Error(),
		})
		return
	}

	// Validate event type
	if !models.IsValidEventType(req.EventType) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event type"})
		return
	}

	// Get website by widget key
	website, err := models.GetWebsiteByWidgetKey(database.DB, widgetKey)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid widget key"})
		return
	}

	// Get client information
	userAgent := c.Request.UserAgent()
	ip := getClientIP(c.Request)
	referrer := c.Request.Referer()

	// Track event
	eventData := models.AnalyticsData(req.EventData)
	if err := h.analyticsService.TrackEvent(
		website.ID,
		req.EventType,
		eventData,
		req.VisitorID,
		req.SessionID,
		userAgent,
		ip,
		referrer,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to track event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Event tracked successfully",
	})
}

// GetEventTypes handles getting valid event types
func (h *AnalyticsHandlers) GetEventTypes(c *gin.Context) {
	eventTypes := models.GetValidEventTypes()
	c.JSON(http.StatusOK, gin.H{
		"event_types": eventTypes,
	})
}

// ExportAnalytics handles exporting analytics data
func (h *AnalyticsHandlers) ExportAnalytics(c *gin.Context) {
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

	var query AnalyticsQuery
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

	// Get analytics for export
	analytics, err := h.analyticsService.GetWebsiteAnalytics(uint(websiteID), startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Set headers for file download
	filename := "analytics_" + query.StartDate + "_to_" + query.EndDate + ".json"
	c.Header("Content-Type", "application/json")
	c.Header("Content-Disposition", "attachment; filename="+filename)

	c.JSON(http.StatusOK, analytics)
}