package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// Analytics represents an analytics event
type Analytics struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	WebsiteID  uint           `json:"website_id" gorm:"not null;index"`
	EventType  string         `json:"event_type" gorm:"not null;index"`
	EventData  AnalyticsData  `json:"event_data" gorm:"type:jsonb"`
	VisitorID  string         `json:"visitor_id" gorm:"index"`
	SessionID  string         `json:"session_id" gorm:"index"`
	UserAgent  string         `json:"user_agent"`
	IP         string         `json:"ip"`
	Country    string         `json:"country"`
	City       string         `json:"city"`
	Referrer   string         `json:"referrer"`
	CreatedAt  time.Time      `json:"created_at" gorm:"index"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Website Website `json:"website,omitempty" gorm:"foreignKey:WebsiteID"`
}

// AnalyticsData contains flexible event data
type AnalyticsData map[string]interface{}

// Implement database/sql/driver.Valuer interface for JSONB
func (ad AnalyticsData) Value() (driver.Value, error) {
	return json.Marshal(ad)
}

// Implement database/sql.Scanner interface for JSONB
func (ad *AnalyticsData) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	
	return json.Unmarshal(bytes, ad)
}

// Analytics event types
const (
	EventTypePageView      = "page_view"
	EventTypeWidgetLoad    = "widget_load"
	EventTypeWidgetOpen    = "widget_open"
	EventTypeWidgetClose   = "widget_close"
	EventTypeChatStart     = "chat_start"
	EventTypeChatEnd       = "chat_end"
	EventTypeMessageSent   = "message_sent"
	EventTypeMessageReceived = "message_received"
	EventTypeUserTyping    = "user_typing"
	EventTypeBotResponse   = "bot_response"
	EventTypeFileUpload    = "file_upload"
	EventTypeRatingGiven   = "rating_given"
	EventTypeEmailCapture  = "email_capture"
	EventTypeConversion    = "conversion"
	EventTypeError         = "error"
)

// AnalyticsCreateRequest represents the request payload for creating analytics
type AnalyticsCreateRequest struct {
	EventType string                 `json:"event_type" binding:"required"`
	EventData map[string]interface{} `json:"event_data"`
	VisitorID string                 `json:"visitor_id"`
	SessionID string                 `json:"session_id"`
}

// DashboardMetrics represents dashboard metrics
type DashboardMetrics struct {
	TotalVisitors     int64                    `json:"total_visitors"`
	TotalPageViews    int64                    `json:"total_page_views"`
	TotalChats        int64                    `json:"total_chats"`
	TotalMessages     int64                    `json:"total_messages"`
	ConversionRate    float64                  `json:"conversion_rate"`
	AvgChatDuration   float64                  `json:"avg_chat_duration"`
	TopPages          []PageMetric             `json:"top_pages"`
	TopCountries      []CountryMetric          `json:"top_countries"`
	HourlyActivity    []HourlyMetric           `json:"hourly_activity"`
	DailyActivity     []DailyMetric            `json:"daily_activity"`
	ChatSatisfaction  []SatisfactionMetric     `json:"chat_satisfaction"`
	ResponseTimes     []ResponseTimeMetric     `json:"response_times"`
}

// PageMetric represents page-level metrics
type PageMetric struct {
	Page      string `json:"page"`
	Views     int64  `json:"views"`
	Visitors  int64  `json:"visitors"`
	AvgTime   float64 `json:"avg_time"`
}

// CountryMetric represents country-level metrics
type CountryMetric struct {
	Country  string `json:"country"`
	Visitors int64  `json:"visitors"`
	Chats    int64  `json:"chats"`
}

// HourlyMetric represents hourly activity metrics
type HourlyMetric struct {
	Hour     int   `json:"hour"`
	Visitors int64 `json:"visitors"`
	Chats    int64 `json:"chats"`
	Messages int64 `json:"messages"`
}

// DailyMetric represents daily activity metrics
type DailyMetric struct {
	Date     string `json:"date"`
	Visitors int64  `json:"visitors"`
	Chats    int64  `json:"chats"`
	Messages int64  `json:"messages"`
}

// SatisfactionMetric represents chat satisfaction metrics
type SatisfactionMetric struct {
	Rating int   `json:"rating"`
	Count  int64 `json:"count"`
}

// ResponseTimeMetric represents response time metrics
type ResponseTimeMetric struct {
	TimeRange string  `json:"time_range"`
	AvgTime   float64 `json:"avg_time"`
	Count     int64   `json:"count"`
}

// WebsiteAnalytics represents comprehensive website analytics
type WebsiteAnalytics struct {
	WebsiteID        uint                     `json:"website_id"`
	Period           string                   `json:"period"`
	StartDate        time.Time                `json:"start_date"`
	EndDate          time.Time                `json:"end_date"`
	Overview         OverviewMetrics          `json:"overview"`
	Traffic          TrafficMetrics           `json:"traffic"`
	Engagement       EngagementMetrics        `json:"engagement"`
	Conversion       ConversionMetrics        `json:"conversion"`
	Geographic       []CountryMetric          `json:"geographic"`
	Temporal         TemporalMetrics          `json:"temporal"`
}

// OverviewMetrics represents overview metrics
type OverviewMetrics struct {
	TotalVisitors    int64   `json:"total_visitors"`
	UniqueVisitors   int64   `json:"unique_visitors"`
	PageViews        int64   `json:"page_views"`
	BounceRate       float64 `json:"bounce_rate"`
	AvgSessionTime   float64 `json:"avg_session_time"`
	NewVisitorRate   float64 `json:"new_visitor_rate"`
}

// TrafficMetrics represents traffic metrics
type TrafficMetrics struct {
	DirectTraffic   int64 `json:"direct_traffic"`
	ReferralTraffic int64 `json:"referral_traffic"`
	SearchTraffic   int64 `json:"search_traffic"`
	SocialTraffic   int64 `json:"social_traffic"`
	EmailTraffic    int64 `json:"email_traffic"`
	OtherTraffic    int64 `json:"other_traffic"`
}

// EngagementMetrics represents engagement metrics
type EngagementMetrics struct {
	ChatInitiations    int64   `json:"chat_initiations"`
	ChatCompletions    int64   `json:"chat_completions"`
	AvgMessagesPerChat float64 `json:"avg_messages_per_chat"`
	AvgChatDuration    float64 `json:"avg_chat_duration"`
	ReturnVisitors     int64   `json:"return_visitors"`
	EngagementRate     float64 `json:"engagement_rate"`
}

// ConversionMetrics represents conversion metrics
type ConversionMetrics struct {
	TotalConversions   int64   `json:"total_conversions"`
	ConversionRate     float64 `json:"conversion_rate"`
	ChatToConversion   float64 `json:"chat_to_conversion"`
	EmailCaptures      int64   `json:"email_captures"`
	LeadGeneration     int64   `json:"lead_generation"`
	SalesConversions   int64   `json:"sales_conversions"`
}

// TemporalMetrics represents time-based metrics
type TemporalMetrics struct {
	HourlyDistribution []HourlyMetric `json:"hourly_distribution"`
	DailyTrend         []DailyMetric  `json:"daily_trend"`
	WeeklyPattern      []WeeklyMetric `json:"weekly_pattern"`
}

// WeeklyMetric represents weekly pattern metrics
type WeeklyMetric struct {
	DayOfWeek int   `json:"day_of_week"`
	Visitors  int64 `json:"visitors"`
	Chats     int64 `json:"chats"`
}

// BeforeCreate is a GORM hook that runs before creating analytics
func (a *Analytics) BeforeCreate(tx *gorm.DB) error {
	// Validate event type
	if !IsValidEventType(a.EventType) {
		return errors.New("invalid event type")
	}
	
	return nil
}

// IsValidEventType checks if an event type is valid
func IsValidEventType(eventType string) bool {
	validTypes := []string{
		EventTypePageView,
		EventTypeWidgetLoad,
		EventTypeWidgetOpen,
		EventTypeWidgetClose,
		EventTypeChatStart,
		EventTypeChatEnd,
		EventTypeMessageSent,
		EventTypeMessageReceived,
		EventTypeUserTyping,
		EventTypeBotResponse,
		EventTypeFileUpload,
		EventTypeRatingGiven,
		EventTypeEmailCapture,
		EventTypeConversion,
		EventTypeError,
	}
	
	for _, validType := range validTypes {
		if eventType == validType {
			return true
		}
	}
	return false
}

// GetValidEventTypes returns all valid event types
func GetValidEventTypes() []string {
	return []string{
		EventTypePageView,
		EventTypeWidgetLoad,
		EventTypeWidgetOpen,
		EventTypeWidgetClose,
		EventTypeChatStart,
		EventTypeChatEnd,
		EventTypeMessageSent,
		EventTypeMessageReceived,
		EventTypeUserTyping,
		EventTypeBotResponse,
		EventTypeFileUpload,
		EventTypeRatingGiven,
		EventTypeEmailCapture,
		EventTypeConversion,
		EventTypeError,
	}
}