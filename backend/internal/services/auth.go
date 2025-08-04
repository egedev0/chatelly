package services

import (
	"errors"

	"chatelly-backend/internal/config"
	"chatelly-backend/internal/models"
	"chatelly-backend/pkg/utils"

	"gorm.io/gorm"
)

// AuthService handles authentication business logic
type AuthService struct {
	db  *gorm.DB
	cfg *config.Config
}

// NewAuthService creates a new AuthService
func NewAuthService(db *gorm.DB, cfg *config.Config) *AuthService {
	return &AuthService{
		db:  db,
		cfg: cfg,
	}
}

// RegisterUser creates a new user account
func (s *AuthService) RegisterUser(req *models.UserCreateRequest) (*models.User, *utils.TokenPair, error) {
	// Check if email is already taken
	taken, err := models.IsEmailTaken(s.db, req.Email)
	if err != nil {
		return nil, nil, err
	}
	if taken {
		return nil, nil, errors.New("email is already registered")
	}

	// Create new user
	user := &models.User{
		Email: req.Email,
		Name:  req.Name,
		Plan:  "free", // Default plan
	}

	// Hash password
	if err := user.HashPassword(req.Password); err != nil {
		return nil, nil, err
	}

	// Save user to database
	if err := s.db.Create(user).Error; err != nil {
		return nil, nil, err
	}

	// Generate token pair
	tokens, err := utils.GenerateTokenPair(user, s.cfg)
	if err != nil {
		return nil, nil, err
	}

	return user, tokens, nil
}

// LoginUser authenticates a user and returns tokens
func (s *AuthService) LoginUser(email, password string) (*models.User, *utils.TokenPair, error) {
	// Find user by email
	var user models.User
	if err := s.db.Where("email = ? AND is_active = ?", email, true).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, errors.New("invalid email or password")
		}
		return nil, nil, err
	}

	// Check password
	if !user.CheckPassword(password) {
		return nil, nil, errors.New("invalid email or password")
	}

	// Generate token pair
	tokens, err := utils.GenerateTokenPair(&user, s.cfg)
	if err != nil {
		return nil, nil, err
	}

	return &user, tokens, nil
}

// RefreshTokens generates new tokens using a refresh token
func (s *AuthService) RefreshTokens(refreshToken string) (*utils.TokenPair, error) {
	// Validate refresh token
	claims, err := utils.ValidateRefreshToken(refreshToken, s.cfg)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Get user from database
	var user models.User
	if err := s.db.Where("id = ? AND is_active = ?", claims.UserID, true).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	// Generate new token pair
	tokens, err := utils.GenerateTokenPair(&user, s.cfg)
	if err != nil {
		return nil, err
	}

	return tokens, nil
}

// GetUserByID retrieves a user by ID
func (s *AuthService) GetUserByID(userID uint) (*models.User, error) {
	var user models.User
	if err := s.db.Where("id = ? AND is_active = ?", userID, true).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &user, nil
}

// UpdateUserProfile updates user profile information
func (s *AuthService) UpdateUserProfile(userID uint, req *models.UserUpdateRequest) (*models.User, error) {
	// Get user
	user, err := s.GetUserByID(userID)
	if err != nil {
		return nil, err
	}

	// Update fields
	if req.Name != "" {
		user.Name = req.Name
	}

	// Save changes
	if err := s.db.Save(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

// ChangePassword changes user password
func (s *AuthService) ChangePassword(userID uint, currentPassword, newPassword string) error {
	// Get user
	user, err := s.GetUserByID(userID)
	if err != nil {
		return err
	}

	// Verify current password
	if !user.CheckPassword(currentPassword) {
		return errors.New("current password is incorrect")
	}

	// Hash new password
	if err := user.HashPassword(newPassword); err != nil {
		return err
	}

	// Save changes
	if err := s.db.Save(user).Error; err != nil {
		return err
	}

	return nil
}

// DeactivateUser deactivates a user account
func (s *AuthService) DeactivateUser(userID uint) error {
	return s.db.Model(&models.User{}).Where("id = ?", userID).Update("is_active", false).Error
}

// ValidateUserAccess checks if user has access to perform an action
func (s *AuthService) ValidateUserAccess(userID uint, requiredPlan string) error {
	user, err := s.GetUserByID(userID)
	if err != nil {
		return err
	}

	// Check if user's plan allows the action
	userLimits := user.GetPlanLimits()
	requiredLimits := models.GetPlanLimits(requiredPlan)

	// Simple plan hierarchy check (this could be more sophisticated)
	planHierarchy := map[string]int{
		"free":     0,
		"starter":  1,
		"pro":      2,
		"pro_max":  3,
	}

	userLevel := planHierarchy[userLimits.Plan]
	requiredLevel := planHierarchy[requiredLimits.Plan]

	if userLevel < requiredLevel {
		return errors.New("insufficient plan privileges")
	}

	return nil
}