package models

import (
	"errors"
	"regexp"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	Name      string         `json:"name" gorm:"not null"`
	Plan      string         `json:"plan" gorm:"default:'free'"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Websites []Website `json:"websites,omitempty" gorm:"foreignKey:UserID"`
}

// UserCreateRequest represents the request payload for user creation
type UserCreateRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required,min=2"`
}

// UserUpdateRequest represents the request payload for user updates
type UserUpdateRequest struct {
	Name string `json:"name" binding:"omitempty,min=2"`
}

// UserResponse represents the user data returned in API responses
type UserResponse struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Plan      string    `json:"plan"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// HashPassword hashes the user's password using bcrypt
func (u *User) HashPassword(password string) error {
	if err := ValidatePassword(password); err != nil {
		return err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	u.Password = string(hashedPassword)
	return nil
}

// CheckPassword verifies if the provided password matches the user's hashed password
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// ToResponse converts User model to UserResponse for API responses
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Email:     u.Email,
		Name:      u.Name,
		Plan:      u.Plan,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

// BeforeCreate is a GORM hook that runs before creating a user
func (u *User) BeforeCreate(tx *gorm.DB) error {
	// Validate email format
	if err := ValidateEmail(u.Email); err != nil {
		return err
	}

	// Ensure password is hashed
	if len(u.Password) < 60 { // bcrypt hashes are typically 60 characters
		return errors.New("password must be hashed before saving")
	}

	// Set default plan if not specified
	if u.Plan == "" {
		u.Plan = "free"
	}

	return nil
}

// BeforeUpdate is a GORM hook that runs before updating a user
func (u *User) BeforeUpdate(tx *gorm.DB) error {
	// Validate email format if it's being updated
	if u.Email != "" {
		if err := ValidateEmail(u.Email); err != nil {
			return err
		}
	}

	return nil
}

// ValidateEmail validates email format using regex
func ValidateEmail(email string) error {
	if email == "" {
		return errors.New("email is required")
	}

	// RFC 5322 compliant email regex (simplified)
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return errors.New("invalid email format")
	}

	return nil
}

// ValidatePassword validates password strength
func ValidatePassword(password string) error {
	if len(password) < 8 {
		return errors.New("password must be at least 8 characters long")
	}

	if len(password) > 128 {
		return errors.New("password must be less than 128 characters long")
	}

	// Check for at least one uppercase letter
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	if !hasUpper {
		return errors.New("password must contain at least one uppercase letter")
	}

	// Check for at least one lowercase letter
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	if !hasLower {
		return errors.New("password must contain at least one lowercase letter")
	}

	// Check for at least one digit
	hasDigit := regexp.MustCompile(`[0-9]`).MatchString(password)
	if !hasDigit {
		return errors.New("password must contain at least one digit")
	}

	// Check for at least one special character
	hasSpecial := regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).MatchString(password)
	if !hasSpecial {
		return errors.New("password must contain at least one special character")
	}

	return nil
}

// GetPlanLimits returns the limits for the user's current plan
func (u *User) GetPlanLimits() PlanLimits {
	return GetPlanLimits(u.Plan)
}

// CanCreateWebsite checks if user can create more websites based on their plan
func (u *User) CanCreateWebsite(db *gorm.DB) (bool, error) {
	limits := u.GetPlanLimits()
	
	// Unlimited websites for pro_max plan
	if limits.MaxWebsites == -1 {
		return true, nil
	}

	// Count current websites
	var count int64
	err := db.Model(&Website{}).Where("user_id = ? AND deleted_at IS NULL", u.ID).Count(&count).Error
	if err != nil {
		return false, err
	}

	return int(count) < limits.MaxWebsites, nil
}

// IsEmailTaken checks if an email is already taken by another user
func IsEmailTaken(db *gorm.DB, email string, excludeUserID ...uint) (bool, error) {
	var count int64
	query := db.Model(&User{}).Where("email = ? AND deleted_at IS NULL", email)
	
	// Exclude current user if updating
	if len(excludeUserID) > 0 {
		query = query.Where("id != ?", excludeUserID[0])
	}
	
	err := query.Count(&count).Error
	return count > 0, err
}