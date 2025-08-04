package services

import (
	"errors"
	"fmt"

	"chatelly-backend/internal/config"
	"chatelly-backend/internal/models"

	"gorm.io/gorm"
)

// WebsiteService handles website business logic
type WebsiteService struct {
	db  *gorm.DB
	cfg *config.Config
}

// NewWebsiteService creates a new WebsiteService
func NewWebsiteService(db *gorm.DB, cfg *config.Config) *WebsiteService {
	return &WebsiteService{
		db:  db,
		cfg: cfg,
	}
}

// CreateWebsite creates a new website for a user
func (s *WebsiteService) CreateWebsite(userID uint, req *models.WebsiteCreateRequest) (*models.Website, error) {
	// Get user to check plan limits
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, errors.New("user not found")
	}

	// Check if user can create more websites
	canCreate, err := user.CanCreateWebsite(s.db)
	if err != nil {
		return nil, err
	}
	if !canCreate {
		return nil, errors.New("website limit reached for your current plan")
	}

	// Validate domain format
	if err := models.ValidateDomain(req.Domain); err != nil {
		return nil, fmt.Errorf("invalid domain: %w", err)
	}

	// Create website
	website := &models.Website{
		UserID:   userID,
		Name:     req.Name,
		Domain:   req.Domain,
		MaxUsers: req.MaxUsers,
		Settings: models.GetDefaultWebsiteSettings(),
	}

	// Set default max users if not provided
	if website.MaxUsers <= 0 {
		website.MaxUsers = 100
	}

	// Save to database (BeforeCreate hook will generate widget key)
	if err := s.db.Create(website).Error; err != nil {
		return nil, fmt.Errorf("failed to create website: %w", err)
	}

	return website, nil
}

// GetWebsitesByUserID retrieves all websites for a user with pagination
func (s *WebsiteService) GetWebsitesByUserID(userID uint, page, limit int) ([]models.Website, int64, error) {
	var websites []models.Website
	var total int64

	// Count total websites
	if err := s.db.Model(&models.Website{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Calculate offset
	offset := (page - 1) * limit

	// Get websites with pagination
	if err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&websites).Error; err != nil {
		return nil, 0, err
	}

	return websites, total, nil
}

// GetWebsiteByID retrieves a website by ID with ownership validation
func (s *WebsiteService) GetWebsiteByID(websiteID, userID uint) (*models.Website, error) {
	var website models.Website
	if err := s.db.Where("id = ? AND user_id = ?", websiteID, userID).First(&website).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("website not found")
		}
		return nil, err
	}

	return &website, nil
}

// GetWebsiteByWidgetKey retrieves a website by widget key (for public access)
func (s *WebsiteService) GetWebsiteByWidgetKey(widgetKey string) (*models.Website, error) {
	return models.GetWebsiteByWidgetKey(s.db, widgetKey)
}

// UpdateWebsite updates a website with ownership validation
func (s *WebsiteService) UpdateWebsite(websiteID, userID uint, req *models.WebsiteUpdateRequest) (*models.Website, error) {
	// Get website with ownership validation
	website, err := s.GetWebsiteByID(websiteID, userID)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Name != "" {
		website.Name = req.Name
	}

	if req.Domain != "" {
		if err := models.ValidateDomain(req.Domain); err != nil {
			return nil, fmt.Errorf("invalid domain: %w", err)
		}
		website.Domain = req.Domain
	}

	if req.MaxUsers > 0 {
		website.MaxUsers = req.MaxUsers
	}

	if req.IsActive != nil {
		website.IsActive = *req.IsActive
	}

	// Update settings if provided
	if req.Settings.Theme != "" {
		website.Settings = req.Settings
	}

	// Save changes
	if err := s.db.Save(website).Error; err != nil {
		return nil, fmt.Errorf("failed to update website: %w", err)
	}

	return website, nil
}

// DeleteWebsite deletes a website with ownership validation
func (s *WebsiteService) DeleteWebsite(websiteID, userID uint) error {
	// Get website with ownership validation
	website, err := s.GetWebsiteByID(websiteID, userID)
	if err != nil {
		return err
	}

	// Soft delete the website (GORM will handle cascade)
	if err := s.db.Delete(website).Error; err != nil {
		return fmt.Errorf("failed to delete website: %w", err)
	}

	return nil
}

// UpdateWebsiteSettings updates only the settings of a website
func (s *WebsiteService) UpdateWebsiteSettings(websiteID, userID uint, settings models.WebsiteSettings) (*models.Website, error) {
	// Get website with ownership validation
	website, err := s.GetWebsiteByID(websiteID, userID)
	if err != nil {
		return nil, err
	}

	// Update settings
	website.Settings = settings

	// Save changes
	if err := s.db.Save(website).Error; err != nil {
		return nil, fmt.Errorf("failed to update website settings: %w", err)
	}

	return website, nil
}

// ToggleWebsiteStatus toggles the active status of a website
func (s *WebsiteService) ToggleWebsiteStatus(websiteID, userID uint) (*models.Website, error) {
	// Get website with ownership validation
	website, err := s.GetWebsiteByID(websiteID, userID)
	if err != nil {
		return nil, err
	}

	// Toggle status
	website.IsActive = !website.IsActive

	// Save changes
	if err := s.db.Save(website).Error; err != nil {
		return nil, fmt.Errorf("failed to toggle website status: %w", err)
	}

	return website, nil
}

// GetWebsiteStats returns statistics for a website
func (s *WebsiteService) GetWebsiteStats(websiteID, userID uint) (map[string]interface{}, error) {
	// Validate ownership
	_, err := s.GetWebsiteByID(websiteID, userID)
	if err != nil {
		return nil, err
	}

	stats := make(map[string]interface{})

	// Count total chats
	var totalChats int64
	if err := s.db.Model(&models.Chat{}).Where("website_id = ?", websiteID).Count(&totalChats).Error; err != nil {
		return nil, err
	}
	stats["total_chats"] = totalChats

	// Count active chats
	var activeChats int64
	if err := s.db.Model(&models.Chat{}).Where("website_id = ? AND is_active = ?", websiteID, true).Count(&activeChats).Error; err != nil {
		return nil, err
	}
	stats["active_chats"] = activeChats

	// Count total messages
	var totalMessages int64
	if err := s.db.Model(&models.Message{}).
		Joins("JOIN chats ON messages.chat_id = chats.id").
		Where("chats.website_id = ?", websiteID).
		Count(&totalMessages).Error; err != nil {
		return nil, err
	}
	stats["total_messages"] = totalMessages

	// Get recent activity (last 24 hours)
	var recentChats int64
	if err := s.db.Model(&models.Chat{}).
		Where("website_id = ? AND created_at > NOW() - INTERVAL '24 hours'", websiteID).
		Count(&recentChats).Error; err != nil {
		return nil, err
	}
	stats["recent_chats"] = recentChats

	return stats, nil
}

// ValidateWebsiteOwnership checks if a user owns a website
func (s *WebsiteService) ValidateWebsiteOwnership(websiteID, userID uint) error {
	var count int64
	if err := s.db.Model(&models.Website{}).
		Where("id = ? AND user_id = ?", websiteID, userID).
		Count(&count).Error; err != nil {
		return err
	}

	if count == 0 {
		return errors.New("website not found or access denied")
	}

	return nil
}

// GetWebsiteAnalytics returns analytics data for a website
func (s *WebsiteService) GetWebsiteAnalytics(websiteID, userID uint, days int) (map[string]interface{}, error) {
	// Validate ownership
	if err := s.ValidateWebsiteOwnership(websiteID, userID); err != nil {
		return nil, err
	}

	analytics := make(map[string]interface{})

	// This would typically involve more complex queries
	// For now, we'll return basic analytics structure
	analytics["period_days"] = days
	analytics["website_id"] = websiteID

	// TODO: Implement detailed analytics queries
	// - Daily chat counts
	// - Message volume trends
	// - User engagement metrics
	// - Response time analytics

	return analytics, nil
}

// RegenerateWidgetKey generates a new widget key for a website
func (s *WebsiteService) RegenerateWidgetKey(websiteID, userID uint) (*models.Website, error) {
	// Get website with ownership validation
	website, err := s.GetWebsiteByID(websiteID, userID)
	if err != nil {
		return nil, err
	}

	// Generate new widget key
	if err := website.GenerateWidgetKey(); err != nil {
		return nil, fmt.Errorf("failed to generate new widget key: %w", err)
	}

	// Save changes
	if err := s.db.Save(website).Error; err != nil {
		return nil, fmt.Errorf("failed to save new widget key: %w", err)
	}

	return website, nil
}

// SearchWebsites searches websites by name or domain for a user
func (s *WebsiteService) SearchWebsites(userID uint, query string, page, limit int) ([]models.Website, int64, error) {
	var websites []models.Website
	var total int64

	// Build search query
	searchQuery := s.db.Model(&models.Website{}).Where("user_id = ?", userID)
	if query != "" {
		searchQuery = searchQuery.Where("name ILIKE ? OR domain ILIKE ?", "%"+query+"%", "%"+query+"%")
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
		Find(&websites).Error; err != nil {
		return nil, 0, err
	}

	return websites, total, nil
}