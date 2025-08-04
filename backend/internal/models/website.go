package models

import (
	"crypto/rand"
	"database/sql/driver"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Website represents a website that uses the chat widget
type Website struct {
	ID          uint            `json:"id" gorm:"primaryKey"`
	UserID      uint            `json:"user_id" gorm:"not null"`
	Name        string          `json:"name" gorm:"not null"`
	Domain      string          `json:"domain" gorm:"not null"`
	WidgetKey   string          `json:"widget_key" gorm:"uniqueIndex;not null"`
	MaxUsers    int             `json:"max_users" gorm:"default:100"`
	IsActive    bool            `json:"is_active" gorm:"default:true"`
	Settings    WebsiteSettings `json:"settings" gorm:"type:jsonb"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	DeletedAt   gorm.DeletedAt  `json:"-" gorm:"index"`

	// Relationships
	User  User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Chats []Chat `json:"chats,omitempty" gorm:"foreignKey:WebsiteID"`
}

// WebsiteCreateRequest represents the request payload for website creation
type WebsiteCreateRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Domain   string `json:"domain" binding:"required"`
	MaxUsers int    `json:"max_users" binding:"omitempty,min=1,max=10000"`
}

// WebsiteUpdateRequest represents the request payload for website updates
type WebsiteUpdateRequest struct {
	Name     string          `json:"name" binding:"omitempty,min=2,max=100"`
	Domain   string          `json:"domain" binding:"omitempty"`
	MaxUsers int             `json:"max_users" binding:"omitempty,min=1,max=10000"`
	IsActive *bool           `json:"is_active" binding:"omitempty"`
	Settings WebsiteSettings `json:"settings" binding:"omitempty"`
}

// WebsiteResponse represents the website data returned in API responses
type WebsiteResponse struct {
	ID        uint            `json:"id"`
	Name      string          `json:"name"`
	Domain    string          `json:"domain"`
	WidgetKey string          `json:"widget_key"`
	MaxUsers  int             `json:"max_users"`
	IsActive  bool            `json:"is_active"`
	Settings  WebsiteSettings `json:"settings"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
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

// GenerateWidgetKey generates a unique widget key for the website
func (w *Website) GenerateWidgetKey() error {
	// Generate UUID-based widget key
	id := uuid.New()
	
	// Add some randomness for extra security
	randomBytes := make([]byte, 8)
	_, err := rand.Read(randomBytes)
	if err != nil {
		return fmt.Errorf("failed to generate random bytes: %w", err)
	}
	
	// Combine UUID and random bytes
	w.WidgetKey = fmt.Sprintf("cw_%s_%s", 
		strings.ReplaceAll(id.String(), "-", "")[:16], 
		hex.EncodeToString(randomBytes))
	
	return nil
}

// ValidateWidgetKey validates the format of a widget key
func ValidateWidgetKey(key string) error {
	if key == "" {
		return errors.New("widget key is required")
	}
	
	// Widget key format: cw_[16 hex chars]_[16 hex chars]
	pattern := `^cw_[a-f0-9]{16}_[a-f0-9]{16}$`
	matched, err := regexp.MatchString(pattern, key)
	if err != nil {
		return fmt.Errorf("failed to validate widget key: %w", err)
	}
	
	if !matched {
		return errors.New("invalid widget key format")
	}
	
	return nil
}

// ValidateDomain validates domain format
func ValidateDomain(domain string) error {
	if domain == "" {
		return errors.New("domain is required")
	}
	
	// Remove protocol if present
	domain = strings.TrimPrefix(domain, "http://")
	domain = strings.TrimPrefix(domain, "https://")
	domain = strings.TrimPrefix(domain, "www.")
	
	// Basic domain validation
	domainRegex := regexp.MustCompile(`^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.?)+$`)
	if !domainRegex.MatchString(domain) {
		return errors.New("invalid domain format")
	}
	
	return nil
}

// ToResponse converts Website model to WebsiteResponse for API responses
func (w *Website) ToResponse() WebsiteResponse {
	return WebsiteResponse{
		ID:        w.ID,
		Name:      w.Name,
		Domain:    w.Domain,
		WidgetKey: w.WidgetKey,
		MaxUsers:  w.MaxUsers,
		IsActive:  w.IsActive,
		Settings:  w.Settings,
		CreatedAt: w.CreatedAt,
		UpdatedAt: w.UpdatedAt,
	}
}

// BeforeCreate is a GORM hook that runs before creating a website
func (w *Website) BeforeCreate(tx *gorm.DB) error {
	// Generate widget key if not set
	if w.WidgetKey == "" {
		if err := w.GenerateWidgetKey(); err != nil {
			return fmt.Errorf("failed to generate widget key: %w", err)
		}
	}
	
	// Validate widget key format
	if err := ValidateWidgetKey(w.WidgetKey); err != nil {
		return fmt.Errorf("invalid widget key: %w", err)
	}
	
	// Validate domain
	if err := ValidateDomain(w.Domain); err != nil {
		return fmt.Errorf("invalid domain: %w", err)
	}
	
	// Set default max users if not specified
	if w.MaxUsers <= 0 {
		w.MaxUsers = 100
	}
	
	// Initialize default settings if empty
	if w.Settings.Theme == "" {
		w.Settings = GetDefaultWebsiteSettings()
	}
	
	return nil
}

// BeforeUpdate is a GORM hook that runs before updating a website
func (w *Website) BeforeUpdate(tx *gorm.DB) error {
	// Validate domain if it's being updated
	if w.Domain != "" {
		if err := ValidateDomain(w.Domain); err != nil {
			return fmt.Errorf("invalid domain: %w", err)
		}
	}
	
	return nil
}

// GetDefaultWebsiteSettings returns default settings for a new website
func GetDefaultWebsiteSettings() WebsiteSettings {
	return WebsiteSettings{
		Theme:              "modern",
		PrimaryColor:       "#3B82F6",
		Position:           "bottom-right",
		WelcomeMessage:     "Hello! How can we help you today?",
		OfflineMessage:     "We're currently offline. Please leave a message and we'll get back to you.",
		Language:           "en",
		TranslationEnabled: false,
		ModerationEnabled:  false,
		CustomCSS:          "",
		AllowedDomains:     []string{},
		BusinessHours:      map[string]string{
			"monday":    "09:00-17:00",
			"tuesday":   "09:00-17:00",
			"wednesday": "09:00-17:00",
			"thursday":  "09:00-17:00",
			"friday":    "09:00-17:00",
			"saturday":  "closed",
			"sunday":    "closed",
		},
	}
}

// IsWidgetKeyTaken checks if a widget key is already taken
func IsWidgetKeyTaken(db *gorm.DB, widgetKey string, excludeWebsiteID ...uint) (bool, error) {
	var count int64
	query := db.Model(&Website{}).Where("widget_key = ? AND deleted_at IS NULL", widgetKey)
	
	// Exclude current website if updating
	if len(excludeWebsiteID) > 0 {
		query = query.Where("id != ?", excludeWebsiteID[0])
	}
	
	err := query.Count(&count).Error
	return count > 0, err
}

// GetWebsiteByWidgetKey finds a website by its widget key
func GetWebsiteByWidgetKey(db *gorm.DB, widgetKey string) (*Website, error) {
	var website Website
	err := db.Where("widget_key = ? AND is_active = ? AND deleted_at IS NULL", widgetKey, true).
		Preload("User").
		First(&website).Error
	
	if err != nil {
		return nil, err
	}
	
	return &website, nil
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