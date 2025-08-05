package main

import (
	"log"

	"chatelly-backend/internal/config"
	"chatelly-backend/internal/database"
	"chatelly-backend/internal/models"
	"chatelly-backend/internal/services"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run database migrations
	if err := database.Migrate(); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Create auth service
	authService := services.NewAuthService(database.DB, cfg)

	// Create test user
	testUser := &models.UserCreateRequest{
		Name:     "Test User",
		Email:    "admin@example.com",
		Password: "Password123!",
	}

	user, tokens, err := authService.RegisterUser(testUser)
	if err != nil {
		log.Printf("Failed to create test user: %v", err)
	} else {
		log.Printf("Test user created successfully:")
		log.Printf("Email: %s", user.Email)
		log.Printf("Access Token: %s", tokens.AccessToken)
		log.Printf("Refresh Token: %s", tokens.RefreshToken)
	}

	// Create another test user
	testUser2 := &models.UserCreateRequest{
		Name:     "Demo User",
		Email:    "demo@example.com",
		Password: "Demo123!",
	}

	user2, tokens2, err := authService.RegisterUser(testUser2)
	if err != nil {
		log.Printf("Failed to create demo user: %v", err)
	} else {
		log.Printf("Demo user created successfully:")
		log.Printf("Email: %s", user2.Email)
		log.Printf("Access Token: %s", tokens2.AccessToken)
		log.Printf("Refresh Token: %s", tokens2.RefreshToken)
	}

	log.Println("Seed completed!")
}
