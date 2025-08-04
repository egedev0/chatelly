package models

import (
	"time"

	"gorm.io/gorm"
)

// Subscription represents a user's subscription
type Subscription struct {
	ID                uint           `json:"id" gorm:"primaryKey"`
	UserID            uint           `json:"user_id" gorm:"not null"`
	Plan              string         `json:"plan" gorm:"not null"`
	Status            string         `json:"status" gorm:"default:'active'"` // active, cancelled, expired
	StripeCustomerID  string         `json:"stripe_customer_id"`
	StripeSubscriptionID string      `json:"stripe_subscription_id"`
	CurrentPeriodStart time.Time     `json:"current_period_start"`
	CurrentPeriodEnd   time.Time     `json:"current_period_end"`
	CancelAtPeriodEnd  bool          `json:"cancel_at_period_end" gorm:"default:false"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// SubscriptionCreateRequest represents the request payload for subscription creation
type SubscriptionCreateRequest struct {
	Plan string `json:"plan" binding:"required,oneof=starter pro pro_max"`
}

// SubscriptionUpdateRequest represents the request payload for subscription updates
type SubscriptionUpdateRequest struct {
	Plan              string `json:"plan" binding:"omitempty,oneof=free starter pro pro_max"`
	CancelAtPeriodEnd *bool  `json:"cancel_at_period_end" binding:"omitempty"`
}

// SubscriptionResponse represents the subscription data returned in API responses
type SubscriptionResponse struct {
	ID                uint      `json:"id"`
	Plan              string    `json:"plan"`
	Status            string    `json:"status"`
	CurrentPeriodStart time.Time `json:"current_period_start"`
	CurrentPeriodEnd   time.Time `json:"current_period_end"`
	CancelAtPeriodEnd  bool      `json:"cancel_at_period_end"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// ToResponse converts Subscription model to SubscriptionResponse for API responses
func (s *Subscription) ToResponse() SubscriptionResponse {
	return SubscriptionResponse{
		ID:                s.ID,
		Plan:              s.Plan,
		Status:            s.Status,
		CurrentPeriodStart: s.CurrentPeriodStart,
		CurrentPeriodEnd:   s.CurrentPeriodEnd,
		CancelAtPeriodEnd:  s.CancelAtPeriodEnd,
		CreatedAt:         s.CreatedAt,
		UpdatedAt:         s.UpdatedAt,
	}
}

// IsActive checks if the subscription is currently active
func (s *Subscription) IsActive() bool {
	return s.Status == "active" && time.Now().Before(s.CurrentPeriodEnd)
}

// IsExpired checks if the subscription has expired
func (s *Subscription) IsExpired() bool {
	return time.Now().After(s.CurrentPeriodEnd)
}

// DaysUntilExpiry returns the number of days until the subscription expires
func (s *Subscription) DaysUntilExpiry() int {
	if s.IsExpired() {
		return 0
	}
	duration := s.CurrentPeriodEnd.Sub(time.Now())
	return int(duration.Hours() / 24)
}

// BeforeCreate is a GORM hook that runs before creating a subscription
func (s *Subscription) BeforeCreate(tx *gorm.DB) error {
	// Set default status if not specified
	if s.Status == "" {
		s.Status = "active"
	}

	// Validate plan
	if !IsValidPlan(s.Plan) {
		return gorm.ErrInvalidValue
	}

	return nil
}

// GetActiveSubscription returns the active subscription for a user
func GetActiveSubscription(db *gorm.DB, userID uint) (*Subscription, error) {
	var subscription Subscription
	err := db.Where("user_id = ? AND status = ? AND current_period_end > ?", 
		userID, "active", time.Now()).First(&subscription).Error
	
	if err != nil {
		return nil, err
	}
	
	return &subscription, nil
}