package services

import (
	"fmt"
	"time"

	"chatelly-backend/internal/config"
	"chatelly-backend/internal/models"

	"gorm.io/gorm"
)

// AnalyticsService handles analytics business logic
type AnalyticsService struct {
	db  *gorm.DB
	cfg *config.Config
}

// NewAnalyticsService creates a new AnalyticsService
func NewAnalyticsService(db *gorm.DB, cfg *config.Config) *AnalyticsService {
	return &AnalyticsService{
		db:  db,
		cfg: cfg,
	}
}

// TrackEvent tracks an analytics event
func (s *AnalyticsService) TrackEvent(websiteID uint, eventType string, eventData models.AnalyticsData, visitorID, sessionID, userAgent, ip, referrer string) error {
	// Get location data from IP (placeholder - would integrate with GeoIP service)
	country, city := s.getLocationFromIP(ip)
	
	analytics := &models.Analytics{
		WebsiteID: websiteID,
		EventType: eventType,
		EventData: eventData,
		VisitorID: visitorID,
		SessionID: sessionID,
		UserAgent: userAgent,
		IP:        ip,
		Country:   country,
		City:      city,
		Referrer:  referrer,
		CreatedAt: time.Now(),
	}
	
	return s.db.Create(analytics).Error
}

// GetDashboardMetrics returns dashboard metrics for a website
func (s *AnalyticsService) GetDashboardMetrics(websiteID uint, days int) (*models.DashboardMetrics, error) {
	startDate := time.Now().AddDate(0, 0, -days)
	
	metrics := &models.DashboardMetrics{}
	
	// Total visitors (unique visitor IDs)
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND created_at >= ?", websiteID, startDate).
		Distinct("visitor_id").
		Count(&metrics.TotalVisitors).Error; err != nil {
		return nil, err
	}
	
	// Total page views
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND event_type = ? AND created_at >= ?", websiteID, models.EventTypePageView, startDate).
		Count(&metrics.TotalPageViews).Error; err != nil {
		return nil, err
	}
	
	// Total chats
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND event_type = ? AND created_at >= ?", websiteID, models.EventTypeChatStart, startDate).
		Count(&metrics.TotalChats).Error; err != nil {
		return nil, err
	}
	
	// Total messages
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND event_type IN ? AND created_at >= ?", websiteID, []string{models.EventTypeMessageSent, models.EventTypeMessageReceived}, startDate).
		Count(&metrics.TotalMessages).Error; err != nil {
		return nil, err
	}
	
	// Conversion rate (conversions / visitors)
	var totalConversions int64
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND event_type = ? AND created_at >= ?", websiteID, models.EventTypeConversion, startDate).
		Count(&totalConversions).Error; err != nil {
		return nil, err
	}
	
	if metrics.TotalVisitors > 0 {
		metrics.ConversionRate = float64(totalConversions) / float64(metrics.TotalVisitors) * 100
	}
	
	// Average chat duration (placeholder - would need chat duration tracking)
	metrics.AvgChatDuration = 0 // TODO: Implement chat duration calculation
	
	// Top pages
	topPages, err := s.getTopPages(websiteID, startDate, 10)
	if err != nil {
		return nil, err
	}
	metrics.TopPages = topPages
	
	// Top countries
	topCountries, err := s.getTopCountries(websiteID, startDate, 10)
	if err != nil {
		return nil, err
	}
	metrics.TopCountries = topCountries
	
	// Hourly activity
	hourlyActivity, err := s.getHourlyActivity(websiteID, startDate)
	if err != nil {
		return nil, err
	}
	metrics.HourlyActivity = hourlyActivity
	
	// Daily activity
	dailyActivity, err := s.getDailyActivity(websiteID, startDate)
	if err != nil {
		return nil, err
	}
	metrics.DailyActivity = dailyActivity
	
	// Chat satisfaction (placeholder)
	metrics.ChatSatisfaction = []models.SatisfactionMetric{
		{Rating: 5, Count: 45},
		{Rating: 4, Count: 32},
		{Rating: 3, Count: 15},
		{Rating: 2, Count: 5},
		{Rating: 1, Count: 3},
	}
	
	// Response times (placeholder)
	metrics.ResponseTimes = []models.ResponseTimeMetric{
		{TimeRange: "0-30s", AvgTime: 15.5, Count: 120},
		{TimeRange: "30s-1m", AvgTime: 45.2, Count: 80},
		{TimeRange: "1-2m", AvgTime: 90.1, Count: 45},
		{TimeRange: "2m+", AvgTime: 180.5, Count: 25},
	}
	
	return metrics, nil
}

// GetWebsiteAnalytics returns comprehensive analytics for a website
func (s *AnalyticsService) GetWebsiteAnalytics(websiteID uint, startDate, endDate time.Time) (*models.WebsiteAnalytics, error) {
	analytics := &models.WebsiteAnalytics{
		WebsiteID: websiteID,
		Period:    fmt.Sprintf("%s to %s", startDate.Format("2006-01-02"), endDate.Format("2006-01-02")),
		StartDate: startDate,
		EndDate:   endDate,
	}
	
	// Overview metrics
	overview, err := s.getOverviewMetrics(websiteID, startDate, endDate)
	if err != nil {
		return nil, err
	}
	analytics.Overview = overview
	
	// Traffic metrics
	traffic, err := s.getTrafficMetrics(websiteID, startDate, endDate)
	if err != nil {
		return nil, err
	}
	analytics.Traffic = traffic
	
	// Engagement metrics
	engagement, err := s.getEngagementMetrics(websiteID, startDate, endDate)
	if err != nil {
		return nil, err
	}
	analytics.Engagement = engagement
	
	// Conversion metrics
	conversion, err := s.getConversionMetrics(websiteID, startDate, endDate)
	if err != nil {
		return nil, err
	}
	analytics.Conversion = conversion
	
	// Geographic data
	geographic, err := s.getTopCountries(websiteID, startDate, 20)
	if err != nil {
		return nil, err
	}
	analytics.Geographic = geographic
	
	// Temporal metrics
	temporal, err := s.getTemporalMetrics(websiteID, startDate, endDate)
	if err != nil {
		return nil, err
	}
	analytics.Temporal = temporal
	
	return analytics, nil
}

// GetEventsByType returns events filtered by type
func (s *AnalyticsService) GetEventsByType(websiteID uint, eventType string, startDate, endDate time.Time, page, limit int) ([]models.Analytics, int64, error) {
	var events []models.Analytics
	var total int64
	
	query := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND event_type = ? AND created_at BETWEEN ? AND ?", websiteID, eventType, startDate, endDate)
	
	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	// Get events with pagination
	offset := (page - 1) * limit
	if err := query.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&events).Error; err != nil {
		return nil, 0, err
	}
	
	return events, total, nil
}

// GetVisitorJourney returns the journey of a specific visitor
func (s *AnalyticsService) GetVisitorJourney(websiteID uint, visitorID string, startDate, endDate time.Time) ([]models.Analytics, error) {
	var events []models.Analytics
	
	if err := s.db.Where("website_id = ? AND visitor_id = ? AND created_at BETWEEN ? AND ?", websiteID, visitorID, startDate, endDate).
		Order("created_at ASC").
		Find(&events).Error; err != nil {
		return nil, err
	}
	
	return events, nil
}

// GetRealTimeMetrics returns real-time metrics for a website
func (s *AnalyticsService) GetRealTimeMetrics(websiteID uint) (map[string]interface{}, error) {
	now := time.Now()
	last5Minutes := now.Add(-5 * time.Minute)
	lastHour := now.Add(-1 * time.Hour)
	
	metrics := make(map[string]interface{})
	
	// Active visitors (last 5 minutes)
	var activeVisitors int64
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND created_at >= ?", websiteID, last5Minutes).
		Distinct("visitor_id").
		Count(&activeVisitors).Error; err != nil {
		return nil, err
	}
	metrics["active_visitors"] = activeVisitors
	
	// Page views in last hour
	var hourlyPageViews int64
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND event_type = ? AND created_at >= ?", websiteID, models.EventTypePageView, lastHour).
		Count(&hourlyPageViews).Error; err != nil {
		return nil, err
	}
	metrics["hourly_page_views"] = hourlyPageViews
	
	// Active chats
	var activeChats int64
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND event_type = ? AND created_at >= ?", websiteID, models.EventTypeChatStart, lastHour).
		Count(&activeChats).Error; err != nil {
		return nil, err
	}
	metrics["active_chats"] = activeChats
	
	// Recent events (last 10)
	var recentEvents []models.Analytics
	if err := s.db.Where("website_id = ? AND created_at >= ?", websiteID, lastHour).
		Order("created_at DESC").
		Limit(10).
		Find(&recentEvents).Error; err != nil {
		return nil, err
	}
	metrics["recent_events"] = recentEvents
	
	return metrics, nil
}

// Helper methods

func (s *AnalyticsService) getTopPages(websiteID uint, startDate time.Time, limit int) ([]models.PageMetric, error) {
	var results []struct {
		Page     string `json:"page"`
		Views    int64  `json:"views"`
		Visitors int64  `json:"visitors"`
	}
	
	// This is a simplified query - in reality, you'd extract page from event_data
	if err := s.db.Model(&models.Analytics{}).
		Select("COALESCE(event_data->>'page', '/') as page, COUNT(*) as views, COUNT(DISTINCT visitor_id) as visitors").
		Where("website_id = ? AND event_type = ? AND created_at >= ?", websiteID, models.EventTypePageView, startDate).
		Group("page").
		Order("views DESC").
		Limit(limit).
		Scan(&results).Error; err != nil {
		return nil, err
	}
	
	pages := make([]models.PageMetric, len(results))
	for i, result := range results {
		pages[i] = models.PageMetric{
			Page:     result.Page,
			Views:    result.Views,
			Visitors: result.Visitors,
			AvgTime:  0, // TODO: Calculate average time on page
		}
	}
	
	return pages, nil
}

func (s *AnalyticsService) getTopCountries(websiteID uint, startDate time.Time, limit int) ([]models.CountryMetric, error) {
	var results []struct {
		Country  string `json:"country"`
		Visitors int64  `json:"visitors"`
		Chats    int64  `json:"chats"`
	}
	
	if err := s.db.Model(&models.Analytics{}).
		Select("country, COUNT(DISTINCT visitor_id) as visitors, COUNT(CASE WHEN event_type = ? THEN 1 END) as chats", models.EventTypeChatStart).
		Where("website_id = ? AND created_at >= ? AND country != ''", websiteID, startDate).
		Group("country").
		Order("visitors DESC").
		Limit(limit).
		Scan(&results).Error; err != nil {
		return nil, err
	}
	
	countries := make([]models.CountryMetric, len(results))
	for i, result := range results {
		countries[i] = models.CountryMetric{
			Country:  result.Country,
			Visitors: result.Visitors,
			Chats:    result.Chats,
		}
	}
	
	return countries, nil
}

func (s *AnalyticsService) getHourlyActivity(websiteID uint, startDate time.Time) ([]models.HourlyMetric, error) {
	var results []struct {
		Hour     int   `json:"hour"`
		Visitors int64 `json:"visitors"`
		Chats    int64 `json:"chats"`
		Messages int64 `json:"messages"`
	}
	
	if err := s.db.Model(&models.Analytics{}).
		Select("EXTRACT(HOUR FROM created_at) as hour, COUNT(DISTINCT visitor_id) as visitors, COUNT(CASE WHEN event_type = ? THEN 1 END) as chats, COUNT(CASE WHEN event_type IN ? THEN 1 END) as messages", models.EventTypeChatStart, []string{models.EventTypeMessageSent, models.EventTypeMessageReceived}).
		Where("website_id = ? AND created_at >= ?", websiteID, startDate).
		Group("hour").
		Order("hour").
		Scan(&results).Error; err != nil {
		return nil, err
	}
	
	hourly := make([]models.HourlyMetric, len(results))
	for i, result := range results {
		hourly[i] = models.HourlyMetric{
			Hour:     result.Hour,
			Visitors: result.Visitors,
			Chats:    result.Chats,
			Messages: result.Messages,
		}
	}
	
	return hourly, nil
}

func (s *AnalyticsService) getDailyActivity(websiteID uint, startDate time.Time) ([]models.DailyMetric, error) {
	var results []struct {
		Date     string `json:"date"`
		Visitors int64  `json:"visitors"`
		Chats    int64  `json:"chats"`
		Messages int64  `json:"messages"`
	}
	
	if err := s.db.Model(&models.Analytics{}).
		Select("DATE(created_at) as date, COUNT(DISTINCT visitor_id) as visitors, COUNT(CASE WHEN event_type = ? THEN 1 END) as chats, COUNT(CASE WHEN event_type IN ? THEN 1 END) as messages", models.EventTypeChatStart, []string{models.EventTypeMessageSent, models.EventTypeMessageReceived}).
		Where("website_id = ? AND created_at >= ?", websiteID, startDate).
		Group("date").
		Order("date").
		Scan(&results).Error; err != nil {
		return nil, err
	}
	
	daily := make([]models.DailyMetric, len(results))
	for i, result := range results {
		daily[i] = models.DailyMetric{
			Date:     result.Date,
			Visitors: result.Visitors,
			Chats:    result.Chats,
			Messages: result.Messages,
		}
	}
	
	return daily, nil
}

func (s *AnalyticsService) getOverviewMetrics(websiteID uint, startDate, endDate time.Time) (models.OverviewMetrics, error) {
	var metrics models.OverviewMetrics
	
	// Total visitors
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND created_at BETWEEN ? AND ?", websiteID, startDate, endDate).
		Distinct("visitor_id").
		Count(&metrics.TotalVisitors).Error; err != nil {
		return metrics, err
	}
	
	// Unique visitors (same as total for now)
	metrics.UniqueVisitors = metrics.TotalVisitors
	
	// Page views
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND event_type = ? AND created_at BETWEEN ? AND ?", websiteID, models.EventTypePageView, startDate, endDate).
		Count(&metrics.PageViews).Error; err != nil {
		return metrics, err
	}
	
	// Placeholder values for other metrics
	metrics.BounceRate = 35.5
	metrics.AvgSessionTime = 180.5
	metrics.NewVisitorRate = 65.2
	
	return metrics, nil
}

func (s *AnalyticsService) getTrafficMetrics(websiteID uint, startDate, endDate time.Time) (models.TrafficMetrics, error) {
	// Placeholder implementation - would analyze referrer data
	return models.TrafficMetrics{
		DirectTraffic:   150,
		ReferralTraffic: 80,
		SearchTraffic:   120,
		SocialTraffic:   45,
		EmailTraffic:    25,
		OtherTraffic:    30,
	}, nil
}

func (s *AnalyticsService) getEngagementMetrics(websiteID uint, startDate, endDate time.Time) (models.EngagementMetrics, error) {
	var metrics models.EngagementMetrics
	
	// Chat initiations
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND event_type = ? AND created_at BETWEEN ? AND ?", websiteID, models.EventTypeChatStart, startDate, endDate).
		Count(&metrics.ChatInitiations).Error; err != nil {
		return metrics, err
	}
	
	// Chat completions
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND event_type = ? AND created_at BETWEEN ? AND ?", websiteID, models.EventTypeChatEnd, startDate, endDate).
		Count(&metrics.ChatCompletions).Error; err != nil {
		return metrics, err
	}
	
	// Placeholder values
	metrics.AvgMessagesPerChat = 5.2
	metrics.AvgChatDuration = 180.5
	metrics.ReturnVisitors = 45
	metrics.EngagementRate = 12.5
	
	return metrics, nil
}

func (s *AnalyticsService) getConversionMetrics(websiteID uint, startDate, endDate time.Time) (models.ConversionMetrics, error) {
	var metrics models.ConversionMetrics
	
	// Total conversions
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND event_type = ? AND created_at BETWEEN ? AND ?", websiteID, models.EventTypeConversion, startDate, endDate).
		Count(&metrics.TotalConversions).Error; err != nil {
		return metrics, err
	}
	
	// Email captures
	if err := s.db.Model(&models.Analytics{}).
		Where("website_id = ? AND event_type = ? AND created_at BETWEEN ? AND ?", websiteID, models.EventTypeEmailCapture, startDate, endDate).
		Count(&metrics.EmailCaptures).Error; err != nil {
		return metrics, err
	}
	
	// Placeholder values
	metrics.ConversionRate = 2.5
	metrics.ChatToConversion = 15.8
	metrics.LeadGeneration = 25
	metrics.SalesConversions = 8
	
	return metrics, nil
}

func (s *AnalyticsService) getTemporalMetrics(websiteID uint, startDate, endDate time.Time) (models.TemporalMetrics, error) {
	var metrics models.TemporalMetrics
	
	// Hourly distribution
	hourly, err := s.getHourlyActivity(websiteID, startDate)
	if err != nil {
		return metrics, err
	}
	metrics.HourlyDistribution = hourly
	
	// Daily trend
	daily, err := s.getDailyActivity(websiteID, startDate)
	if err != nil {
		return metrics, err
	}
	metrics.DailyTrend = daily
	
	// Weekly pattern (placeholder)
	metrics.WeeklyPattern = []models.WeeklyMetric{
		{DayOfWeek: 1, Visitors: 120, Chats: 15}, // Monday
		{DayOfWeek: 2, Visitors: 135, Chats: 18}, // Tuesday
		{DayOfWeek: 3, Visitors: 142, Chats: 22}, // Wednesday
		{DayOfWeek: 4, Visitors: 138, Chats: 20}, // Thursday
		{DayOfWeek: 5, Visitors: 125, Chats: 16}, // Friday
		{DayOfWeek: 6, Visitors: 95, Chats: 8},   // Saturday
		{DayOfWeek: 0, Visitors: 85, Chats: 6},   // Sunday
	}
	
	return metrics, nil
}

func (s *AnalyticsService) getLocationFromIP(ip string) (country, city string) {
	// Placeholder implementation - would integrate with GeoIP service
	// For now, return default values
	return "Unknown", "Unknown"
}