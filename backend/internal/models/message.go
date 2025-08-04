package models

import (
	"time"

	"gorm.io/gorm"
)

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
	Chat Chat `json:"chat,omitempty" gorm:"foreignKey:ChatID"`
}