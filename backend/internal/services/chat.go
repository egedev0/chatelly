package services

import (
	"errors"
	"fmt"
	"time"

	"chatelly-backend/internal/config"
	"chatelly-backend/internal/models"

	"gorm.io/gorm"
)

// ChatService handles chat business logic
type ChatService struct {
	db  *gorm.DB
	cfg *config.Config
}

// NewChatService creates a new ChatService
func NewChatService(db *gorm.DB, cfg *config.Config) *ChatService {
	return &ChatService{
		db:  db,
		cfg: cfg,
	}
}

// CreateOrGetChat creates a new chat session or returns existing one
func (s *ChatService) CreateOrGetChat(websiteID uint, sessionID, visitorIP, userAgent, language string) (*models.Chat, error) {
	// Try to find existing active chat
	var chat models.Chat
	err := s.db.Where("website_id = ? AND session_id = ? AND is_active = ?", 
		websiteID, sessionID, true).First(&chat).Error
	
	if err == nil {
		// Chat exists, return it
		return &chat, nil
	}
	
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		// Database error
		return nil, err
	}
	
	// Create new chat
	chat = models.Chat{
		WebsiteID: websiteID,
		SessionID: sessionID,
		VisitorIP: visitorIP,
		UserAgent: userAgent,
		Language:  language,
		IsActive:  true,
		StartedAt: time.Now(),
	}
	
	if err := s.db.Create(&chat).Error; err != nil {
		return nil, fmt.Errorf("failed to create chat: %w", err)
	}
	
	return &chat, nil
}

// GetChatByID retrieves a chat by ID
func (s *ChatService) GetChatByID(chatID uint) (*models.Chat, error) {
	var chat models.Chat
	if err := s.db.Preload("Website").Preload("Messages").First(&chat, chatID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("chat not found")
		}
		return nil, err
	}
	
	return &chat, nil
}

// GetChatsByWebsiteID retrieves chats for a website with pagination
func (s *ChatService) GetChatsByWebsiteID(websiteID uint, page, limit int) ([]models.Chat, int64, error) {
	var chats []models.Chat
	var total int64
	
	// Count total chats
	if err := s.db.Model(&models.Chat{}).Where("website_id = ?", websiteID).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	// Calculate offset
	offset := (page - 1) * limit
	
	// Get chats with pagination
	if err := s.db.Where("website_id = ?", websiteID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&chats).Error; err != nil {
		return nil, 0, err
	}
	
	return chats, total, nil
}

// EndChat ends a chat session
func (s *ChatService) EndChat(chatID uint) error {
	now := time.Now()
	return s.db.Model(&models.Chat{}).Where("id = ?", chatID).Updates(map[string]interface{}{
		"is_active": false,
		"ended_at":  &now,
	}).Error
}

// SaveMessage saves a message to the database
func (s *ChatService) SaveMessage(chatID uint, content, sender, language string, isFromBot bool) (*models.Message, error) {
	message := &models.Message{
		ChatID:          chatID,
		Content:         content,
		OriginalContent: content, // Store original before any processing
		Sender:          sender,
		Language:        language,
		Translated:      false,
		Moderated:       false,
		Flagged:         false,
		Timestamp:       time.Now(),
	}
	
	if err := s.db.Create(message).Error; err != nil {
		return nil, fmt.Errorf("failed to save message: %w", err)
	}
	
	return message, nil
}

// GetMessagesByChatID retrieves messages for a chat
func (s *ChatService) GetMessagesByChatID(chatID uint, page, limit int) ([]models.Message, int64, error) {
	var messages []models.Message
	var total int64
	
	// Count total messages
	if err := s.db.Model(&models.Message{}).Where("chat_id = ?", chatID).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	// Calculate offset
	offset := (page - 1) * limit
	
	// Get messages with pagination, ordered by timestamp
	if err := s.db.Where("chat_id = ?", chatID).
		Order("timestamp ASC").
		Limit(limit).
		Offset(offset).
		Find(&messages).Error; err != nil {
		return nil, 0, err
	}
	
	return messages, total, nil
}

// GetRecentMessages retrieves recent messages for a chat (for WebSocket history)
func (s *ChatService) GetRecentMessages(chatID uint, limit int) ([]models.Message, error) {
	var messages []models.Message
	
	if err := s.db.Where("chat_id = ?", chatID).
		Order("timestamp DESC").
		Limit(limit).
		Find(&messages).Error; err != nil {
		return nil, err
	}
	
	// Reverse to get chronological order
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}
	
	return messages, nil
}

// UpdateMessage updates a message (for moderation, translation, etc.)
func (s *ChatService) UpdateMessage(messageID uint, updates map[string]interface{}) error {
	return s.db.Model(&models.Message{}).Where("id = ?", messageID).Updates(updates).Error
}

// FlagMessage flags a message for moderation
func (s *ChatService) FlagMessage(messageID uint, reason string) error {
	return s.UpdateMessage(messageID, map[string]interface{}{
		"flagged":   true,
		"moderated": true,
	})
}

// TranslateMessage translates a message and saves the translation
func (s *ChatService) TranslateMessage(messageID uint, translatedContent, targetLanguage string) error {
	return s.UpdateMessage(messageID, map[string]interface{}{
		"content":    translatedContent,
		"language":   targetLanguage,
		"translated": true,
	})
}

// GetChatStats returns statistics for chats
func (s *ChatService) GetChatStats(websiteID uint, days int) (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	// Date range
	startDate := time.Now().AddDate(0, 0, -days)
	
	// Total chats in period
	var totalChats int64
	if err := s.db.Model(&models.Chat{}).
		Where("website_id = ? AND created_at >= ?", websiteID, startDate).
		Count(&totalChats).Error; err != nil {
		return nil, err
	}
	stats["total_chats"] = totalChats
	
	// Active chats
	var activeChats int64
	if err := s.db.Model(&models.Chat{}).
		Where("website_id = ? AND is_active = ?", websiteID, true).
		Count(&activeChats).Error; err != nil {
		return nil, err
	}
	stats["active_chats"] = activeChats
	
	// Total messages in period
	var totalMessages int64
	if err := s.db.Model(&models.Message{}).
		Joins("JOIN chats ON messages.chat_id = chats.id").
		Where("chats.website_id = ? AND messages.created_at >= ?", websiteID, startDate).
		Count(&totalMessages).Error; err != nil {
		return nil, err
	}
	stats["total_messages"] = totalMessages
	
	// Average messages per chat
	if totalChats > 0 {
		stats["avg_messages_per_chat"] = float64(totalMessages) / float64(totalChats)
	} else {
		stats["avg_messages_per_chat"] = 0
	}
	
	// Average chat duration (for ended chats)
	var avgDuration float64
	if err := s.db.Model(&models.Chat{}).
		Select("AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration").
		Where("website_id = ? AND ended_at IS NOT NULL AND created_at >= ?", websiteID, startDate).
		Scan(&avgDuration).Error; err != nil {
		return nil, err
	}
	stats["avg_chat_duration_seconds"] = avgDuration
	
	return stats, nil
}

// SearchChats searches chats by various criteria
func (s *ChatService) SearchChats(websiteID uint, query string, status string, page, limit int) ([]models.Chat, int64, error) {
	var chats []models.Chat
	var total int64
	
	// Build search query
	searchQuery := s.db.Model(&models.Chat{}).Where("website_id = ?", websiteID)
	
	if query != "" {
		searchQuery = searchQuery.Where("session_id ILIKE ? OR visitor_ip ILIKE ?", "%"+query+"%", "%"+query+"%")
	}
	
	if status != "" {
		if status == "active" {
			searchQuery = searchQuery.Where("is_active = ?", true)
		} else if status == "ended" {
			searchQuery = searchQuery.Where("is_active = ?", false)
		}
	}
	
	// Count total results
	if err := searchQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	// Calculate offset
	offset := (page - 1) * limit
	
	// Get results with pagination
	if err := searchQuery.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&chats).Error; err != nil {
		return nil, 0, err
	}
	
	return chats, total, nil
}

// GetChatHistory returns formatted chat history for WebSocket
func (s *ChatService) GetChatHistory(chatID uint, limit int) ([]map[string]interface{}, error) {
	messages, err := s.GetRecentMessages(chatID, limit)
	if err != nil {
		return nil, err
	}
	
	history := make([]map[string]interface{}, len(messages))
	for i, msg := range messages {
		history[i] = map[string]interface{}{
			"id":        msg.ID,
			"content":   msg.Content,
			"sender":    msg.Sender,
			"timestamp": msg.Timestamp.Unix(),
			"language":  msg.Language,
		}
	}
	
	return history, nil
}

// ValidateChatAccess validates if a user has access to a chat
func (s *ChatService) ValidateChatAccess(chatID, userID uint) error {
	var count int64
	if err := s.db.Model(&models.Chat{}).
		Joins("JOIN websites ON chats.website_id = websites.id").
		Where("chats.id = ? AND websites.user_id = ?", chatID, userID).
		Count(&count).Error; err != nil {
		return err
	}
	
	if count == 0 {
		return errors.New("chat not found or access denied")
	}
	
	return nil
}

// GetActiveChatsByWebsite returns active chats for a website
func (s *ChatService) GetActiveChatsByWebsite(websiteID uint) ([]models.Chat, error) {
	var chats []models.Chat
	if err := s.db.Where("website_id = ? AND is_active = ?", websiteID, true).
		Order("started_at DESC").
		Find(&chats).Error; err != nil {
		return nil, err
	}
	
	return chats, nil
}

// ProcessMessage processes a message (validation, moderation, etc.)
func (s *ChatService) ProcessMessage(message *models.Message) error {
	// TODO: Implement message processing logic
	// - Content validation
	// - Spam detection
	// - Profanity filtering
	// - Auto-moderation
	// - Translation if needed
	
	// For now, just basic validation
	if len(message.Content) == 0 {
		return errors.New("message content cannot be empty")
	}
	
	if len(message.Content) > 1000 {
		return errors.New("message content too long")
	}
	
	return nil
}

// GetChatAnalytics returns detailed analytics for chats
func (s *ChatService) GetChatAnalytics(websiteID uint, startDate, endDate time.Time) (map[string]interface{}, error) {
	analytics := make(map[string]interface{})
	
	// Daily chat counts
	var dailyStats []struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}
	
	if err := s.db.Model(&models.Chat{}).
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("website_id = ? AND created_at BETWEEN ? AND ?", websiteID, startDate, endDate).
		Group("DATE(created_at)").
		Order("date").
		Scan(&dailyStats).Error; err != nil {
		return nil, err
	}
	analytics["daily_chats"] = dailyStats
	
	// Language distribution
	var languageStats []struct {
		Language string `json:"language"`
		Count    int64  `json:"count"`
	}
	
	if err := s.db.Model(&models.Chat{}).
		Select("language, COUNT(*) as count").
		Where("website_id = ? AND created_at BETWEEN ? AND ?", websiteID, startDate, endDate).
		Group("language").
		Order("count DESC").
		Scan(&languageStats).Error; err != nil {
		return nil, err
	}
	analytics["language_distribution"] = languageStats
	
	return analytics, nil
}