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
	websiteHandlers := handlers.NewWebsiteHandlers(cfg)
	chatHandlers := handlers.NewChatHandlers(cfg)
	widgetHandlers := handlers.NewWidgetHandlers(cfg)
	analyticsHandlers := handlers.NewAnalyticsHandlers(cfg)

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
			protected.GET("/websites", websiteHandlers.GetWebsites)
			protected.POST("/websites", websiteHandlers.CreateWebsite)
			protected.GET("/websites/search", websiteHandlers.SearchWebsites)
			protected.GET("/websites/:id", websiteHandlers.GetWebsite)
			protected.PUT("/websites/:id", websiteHandlers.UpdateWebsite)
			protected.DELETE("/websites/:id", websiteHandlers.DeleteWebsite)
			protected.PUT("/websites/:id/settings", websiteHandlers.UpdateWebsiteSettings)
			protected.POST("/websites/:id/toggle-status", websiteHandlers.ToggleWebsiteStatus)
			protected.GET("/websites/:id/stats", websiteHandlers.GetWebsiteStats)
			protected.GET("/websites/:id/analytics", websiteHandlers.GetWebsiteAnalytics)
			protected.POST("/websites/:id/regenerate-key", websiteHandlers.RegenerateWidgetKey)

			// Chat routes
			protected.GET("/websites/:id/chats", chatHandlers.GetChats)
			protected.GET("/websites/:id/chats/search", chatHandlers.SearchChats)
			protected.GET("/websites/:id/chats/active", chatHandlers.GetActiveChats)
			protected.GET("/websites/:id/chats/stats", chatHandlers.GetChatStats)
			protected.GET("/websites/:id/chats/analytics", chatHandlers.GetChatAnalytics)
			protected.GET("/chats/:id", chatHandlers.GetChat)
			protected.GET("/chats/:id/messages", chatHandlers.GetMessages)
			protected.POST("/chats/:id/end", chatHandlers.EndChat)
			protected.POST("/messages/:id/flag", chatHandlers.FlagMessage)

			// Subscription routes
			protected.GET("/subscription", handlers.GetSubscription)
			protected.POST("/subscription", handlers.CreateSubscription)
			protected.PUT("/subscription", handlers.UpdateSubscription)

			// Widget management routes (protected)
			protected.GET("/widget/themes", widgetHandlers.GetAvailableThemes)
			protected.GET("/widget/positions", widgetHandlers.GetAvailablePositions)
			protected.POST("/widget/validate-settings", widgetHandlers.ValidateWidgetSettings)
			protected.POST("/widget/preview", widgetHandlers.PreviewWidget)

			// Analytics routes (protected)
			protected.GET("/analytics/dashboard", analyticsHandlers.GetDashboardMetrics)
			protected.GET("/analytics/event-types", analyticsHandlers.GetEventTypes)
			protected.GET("/websites/:id/analytics", analyticsHandlers.GetWebsiteAnalytics)
			protected.GET("/websites/:id/analytics/events", analyticsHandlers.GetEventsByType)
			protected.GET("/websites/:id/analytics/visitors/:visitor_id", analyticsHandlers.GetVisitorJourney)
			protected.GET("/websites/:id/analytics/realtime", analyticsHandlers.GetRealTimeMetrics)
			protected.GET("/websites/:id/analytics/export", analyticsHandlers.ExportAnalytics)
		}
	}

	// Widget routes (public)
	widget := router.Group("/widget")
	{
		// WebSocket endpoint for chat
		widget.GET("/ws/:widget_key", func(c *gin.Context) {
			widgetHandlers.HandleWebSocket(hub, c)
		})

		// Widget configuration
		widget.GET("/config/:widget_key", widgetHandlers.GetWidgetConfig)

		// Widget script
		widget.GET("/script/:widget_key", widgetHandlers.GetWidgetScript)

		// Event tracking (public)
		widget.POST("/track/:widget_key", analyticsHandlers.TrackEvent)
	}

	// Start server
	addr := cfg.Server.Host + ":" + cfg.Server.Port
	log.Printf("Server starting on %s", addr)
	log.Fatal(http.ListenAndServe(addr, router))
}