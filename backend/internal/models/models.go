package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	FirstName string         `json:"first_name"`
	LastName  string         `json:"last_name"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Websites      []Website      `json:"websites" gorm:"foreignKey:UserID"`
	Subscriptions []Subscription `json:"subscriptions" gorm:"foreignKey:UserID"`
}

// Website represents a website that uses the chat widget
type Website struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"not null"`
	Name        string         `json:"name" gorm:"not null"`
	Domain      string         `json:"domain" gorm:"not null"`
	WidgetKey   string         `json:"widget_key" gorm:"uniqueIndex;not null"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	Settings    WebsiteSettings `json:"settings" gorm:"type:jsonb"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User  User   `json:"user" gorm:"foreignKey:UserID"`
	Chats []Chat `json:"chats" gorm:"foreignKey:WebsiteID"`
}

// WebsiteSettings contains widget configuration
type WebsiteSettings struct {
	Theme           string            `json:"theme"`
	PrimaryColor    string            `json:"primary_color"`
	Position        string            `json:"position"`
	WelcomeMessage  string            `json:"welcome_message"`
	OfflineMessage  string            `json:"offline_message"`
	Language        string            `json:"language"`
	TranslationEnabled bool           `json:"translation_enabled"`
	ModerationEnabled  bool           `json:"moderation_enabled"`
	CustomCSS       string            `json:"custom_css"`
	AllowedDomains  []string          `json:"allowed_domains"`
	BusinessHours   map[string]string `json:"business_hours"`
}

// Chat represents a chat session
type Chat struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	WebsiteID  uint           `json:"website_id" gorm:"not null"`
	SessionID  string         `json:"session_id" gorm:"uniqueIndex;not null"`
	VisitorIP  string         `json:"visitor_ip"`
	UserAgent  string         `json:"user_agent"`
	Language   string         `json:"language"`
	IsActive   bool           `json:"is_active" gorm:"default:true"`
	StartedAt  time.Time      `json:"started_at"`
	EndedAt    *time.Time     `json:"ended_at"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Website  Website   `json:"website" gorm:"foreignKey:WebsiteID"`
	Messages []Message `json:"messages" gorm:"foreignKey:ChatID"`
}

// Message represents a chat message
type Message struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	ChatID          uint           `json:"chat_id" gorm:"not null"`
	Content         string         `json:"content" gorm:"not null"`
	OriginalContent string         `json:"original_content"`
	Sender          string         `json:"sender" gorm:"not null"` // 'user' or 'bot'
	Language        string         `json:"language"`
	Translated      bool           `json:"translated" gorm:"default:false"`
	Moderated       bool           `json:"moderated" gorm:"default:false"`
	Flagged         bool           `json:"flagged" gorm:"default:false"`
	Timestamp       time.Time      `json:"timestamp"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Chat Chat `json:"chat" gorm:"foreignKey:ChatID"`
}

// Subscription represents user subscription plans
type Subscription struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	UserID        uint           `json:"user_id" gorm:"not null"`
	Plan          string         `json:"plan" gorm:"not null"` // 'starter', 'pro', 'pro_max'
	Status        string         `json:"status" gorm:"not null"` // 'active', 'cancelled', 'expired'
	StartDate     time.Time      `json:"start_date"`
	EndDate       time.Time      `json:"end_date"`
	AutoRenew     bool           `json:"auto_renew" gorm:"default:true"`
	PaymentMethod string         `json:"payment_method"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User User `json:"user" gorm:"foreignKey:UserID"`
}

// PlanLimits defines limits for each subscription plan
type PlanLimits struct {
	Plan            string `json:"plan"`
	MaxWebsites     int    `json:"max_websites"`
	MaxChatsPerDay  int    `json:"max_chats_per_day"`
	MaxMessages     int    `json:"max_messages"`
	Translation     bool   `json:"translation"`
	Moderation      bool   `json:"moderation"`
	CustomBranding  bool   `json:"custom_branding"`
	Analytics       bool   `json:"analytics"`
	APIAccess       bool   `json:"api_access"`
	PrioritySupport bool   `json:"priority_support"`
}

// GetPlanLimits returns the limits for a given plan
func GetPlanLimits(plan string) PlanLimits {
	switch plan {
	case "starter":
		return PlanLimits{
			Plan:            "starter",
			MaxWebsites:     1,
			MaxChatsPerDay:  100,
			MaxMessages:     1000,
			Translation:     false,
			Moderation:      false,
			CustomBranding:  false,
			Analytics:       false,
			APIAccess:       false,
			PrioritySupport: false,
		}
	case "pro":
		return PlanLimits{
			Plan:            "pro",
			MaxWebsites:     5,
			MaxChatsPerDay:  1000,
			MaxMessages:     10000,
			Translation:     true,
			Moderation:      true,
			CustomBranding:  true,
			Analytics:       true,
			APIAccess:       false,
			PrioritySupport: false,
		}
	case "pro_max":
		return PlanLimits{
			Plan:            "pro_max",
			MaxWebsites:     -1, // unlimited
			MaxChatsPerDay:  -1, // unlimited
			MaxMessages:     -1, // unlimited
			Translation:     true,
			Moderation:      true,
			CustomBranding:  true,
			Analytics:       true,
			APIAccess:       true,
			PrioritySupport: true,
		}
	default:
		return GetPlanLimits("starter")
	}
}