package services

import (
	"errors"

	"chatelly-backend/internal/config"
	"chatelly-backend/internal/models"
	"chatelly-backend/pkg/utils"

	"gorm.io/gorm"
)

type AuthService struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewAuthService(db *gorm.DB, cfg *config.Config) *AuthService {
	return &AuthService{
		db:  db,
		cfg: cfg,
	}
}

func (s *AuthService) RegisterUser(req *models.UserCreateRequest) (*models.User, *utils.TokenPair, error) {
	
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
		Plan:  "free", 
	}

	if err := user.HashPassword(req.Password); err != nil {
		return nil, nil, err
	}

	if err := s.db.Create(user).Error; err != nil {
		return nil, nil, err
	}

	tokens, err := utils.GenerateTokenPair(user, s.cfg)
	if err != nil {
		return nil, nil, err
	}

	return user, tokens, nil
}

func (s *AuthService) LoginUser(email, password string) (*models.User, *utils.TokenPair, error) {
	
	var user models.User
	if err := s.db.Where("email = ? AND is_active = ?", email, true).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, errors.New("invalid email or password")
		}
		return nil, nil, err
	}

	if !user.CheckPassword(password) {
		return nil, nil, errors.New("invalid email or password")
	}

	tokens, err := utils.GenerateTokenPair(&user, s.cfg)
	if err != nil {
		return nil, nil, err
	}

	return &user, tokens, nil
}

func (s *AuthService) RefreshTokens(refreshToken string) (*utils.TokenPair, error) {

	claims, err := utils.ValidateRefreshToken(refreshToken, s.cfg)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	var user models.User
	if err := s.db.Where("id = ? AND is_active = ?", claims.UserID, true).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	tokens, err := utils.GenerateTokenPair(&user, s.cfg)
	if err != nil {
		return nil, err
	}

	return tokens, nil
}

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


func (s *AuthService) UpdateUserProfile(userID uint, req *models.UserUpdateRequest) (*models.User, error) {
	
	user, err := s.GetUserByID(userID)
	if err != nil {
		return nil, err
	}


	if req.Name != "" {
		user.Name = req.Name
	}

	
	if err := s.db.Save(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}


func (s *AuthService) ChangePassword(userID uint, currentPassword, newPassword string) error {
	
	user, err := s.GetUserByID(userID)
	if err != nil {
		return err
	}

	
	if !user.CheckPassword(currentPassword) {
		return errors.New("current password is incorrect")
	}

	
	if err := user.HashPassword(newPassword); err != nil {
		return err
	}

	
	if err := s.db.Save(user).Error; err != nil {
		return err
	}

	return nil
}


func (s *AuthService) DeactivateUser(userID uint) error {
	return s.db.Model(&models.User{}).Where("id = ?", userID).Update("is_active", false).Error
}


func (s *AuthService) ValidateUserAccess(userID uint, requiredPlan string) error {
	user, err := s.GetUserByID(userID)
	if err != nil {
		return err
	}

	
	userLimits := user.GetPlanLimits()
	requiredLimits := models.GetPlanLimits(requiredPlan)

	
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