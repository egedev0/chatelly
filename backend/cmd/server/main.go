package main

import (
	"log"
	"net/http"

	"chatelly-backend/internal/config"
	"chatelly-backend/internal/database"
	"chatelly-backend/internal/handlers"
	"chatelly-backend/internal/middleware"
	"chatelly-backend/pkg/websocket"

	"github.com/gin-gonic/gin"
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

	// Create WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	// Setup Gin router
	if cfg.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Add middleware
	router.Use(middleware.CORS())
	router.Use(middleware.Logger())
	router.Use(middleware.Recovery())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "chatelly-backend",
		})
	})

	// Initialize handlers
	authHandlers := handlers.NewAuthHandlers(cfg)

	// API routes
	api := router.Group("/api/v1")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandlers.Register)
			auth.POST("/login", authHandlers.Login)
			auth.POST("/refresh", authHandlers.RefreshToken)
			auth.POST("/logout", authHandlers.Logout)
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthRequired(cfg))
		{
			// User routes
			protected.GET("/user/profile", authHandlers.GetProfile)
			protected.PUT("/user/profile", authHandlers.UpdateProfile)
			protected.POST("/user/change-password", authHandlers.ChangePassword)

			// Website routes
			protected.GET("/websites", handlers.GetWebsites)
			protected.POST("/websites", handlers.CreateWebsite)
			protected.GET("/websites/:id", handlers.GetWebsite)
			protected.PUT("/websites/:id", handlers.UpdateWebsite)
			protected.DELETE("/websites/:id", handlers.DeleteWebsite)

			// Chat routes
			protected.GET("/websites/:id/chats", handlers.GetChats)
			protected.GET("/chats/:id/messages", handlers.GetMessages)

			// Subscription routes
			protected.GET("/subscription", handlers.GetSubscription)
			protected.POST("/subscription", handlers.CreateSubscription)
			protected.PUT("/subscription", handlers.UpdateSubscription)
		}
	}

	// Widget routes (public)
	widget := router.Group("/widget")
	{
		// WebSocket endpoint for chat
		widget.GET("/ws/:widget_key", func(c *gin.Context) {
			handlers.HandleWebSocket(hub, c)
		})

		// Widget configuration
		widget.GET("/config/:widget_key", handlers.GetWidgetConfig)

		// Widget script
		widget.GET("/script/:widget_key", handlers.GetWidgetScript)
	}

	// Start server
	addr := cfg.Server.Host + ":" + cfg.Server.Port
	log.Printf("Server starting on %s", addr)
	log.Fatal(http.ListenAndServe(addr, router))
}