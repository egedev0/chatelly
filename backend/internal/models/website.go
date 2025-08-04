package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// Website represents a website that uses the chat widget
type Website struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"not null"`
	Name        string         `json:"name" gorm:"not null"`
	Domain      string         `json:"domain" gorm:"not null"`
	WidgetKey   string         `json:"widget_key" gorm:"uniqueIndex;not null"`
	MaxUsers    int            `json:"max_users" gorm:"default:100"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	Settings    WebsiteSettings `json:"settings" gorm:"type:jsonb"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User  User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Chats []Chat `json:"chats,omitempty" gorm:"foreignKey:WebsiteID"`
}

// WebsiteSettings contains widget configuration
type WebsiteSettings struct {
	Theme              string            `json:"theme"`
	PrimaryColor       string            `json:"primary_color"`
	Position           string            `json:"position"`
	WelcomeMessage     string            `json:"welcome_message"`
	OfflineMessage     string            `json:"offline_message"`
	Language           string            `json:"language"`
	TranslationEnabled bool              `json:"translation_enabled"`
	ModerationEnabled  bool              `json:"moderation_enabled"`
	CustomCSS          string            `json:"custom_css"`
	AllowedDomains     []string          `json:"allowed_domains"`
	BusinessHours      map[string]string `json:"business_hours"`
}

// Implement database/sql/driver.Valuer interface for JSONB
func (ws WebsiteSettings) Value() (driver.Value, error) {
	return json.Marshal(ws)
}

// Implement database/sql.Scanner interface for JSONB
func (ws *WebsiteSettings) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	
	return json.Unmarshal(bytes, ws)
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
	Website  Website   `json:"website,omitempty" gorm:"foreignKey:WebsiteID"`
	Messages []Message `json:"messages,omitempty" gorm:"foreignKey:ChatID"`
}