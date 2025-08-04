package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"chatelly-backend/internal/config"
	"chatelly-backend/pkg/redis"
	"chatelly-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

// CORS middleware with configurable origins
func CORS(cfg *config.Config) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		
		// Check if origin is allowed
		if isOriginAllowed(origin, cfg) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			// For development, allow localhost
			if cfg.Server.Env == "development" && strings.Contains(origin, "localhost") {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			}
		}
		
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 hours

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})
}

// isOriginAllowed checks if origin is in allowed list
func isOriginAllowed(origin string, cfg *config.Config) bool {
	// TODO: Get allowed origins from config
	allowedOrigins := []string{
		"https://chatelly.com",
		"https://www.chatelly.com",
		"https://app.chatelly.com",
	}
	
	for _, allowed := range allowedOrigins {
		if origin == allowed {
			return true
		}
	}
	
	return false
}

// Logger middleware
func Logger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}

// Recovery middleware
func Recovery() gin.HandlerFunc {
	return gin.Recovery()
}

// AuthRequired middleware
func AuthRequired(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		
		// Extract token from header
		tokenString, err := utils.ExtractTokenFromHeader(authHeader)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		// Validate access token
		claims, err := utils.ValidateAccessToken(tokenString, cfg)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Set user information in context
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("plan", claims.Plan)

		c.Next()
	}
}

// RateLimitConfig represents rate limiting configuration
type RateLimitConfig struct {
	RequestsPerMinute int
	RequestsPerHour   int
	BurstSize         int
}

// GetDefaultRateLimits returns default rate limits
func GetDefaultRateLimits() RateLimitConfig {
	return RateLimitConfig{
		RequestsPerMinute: 60,
		RequestsPerHour:   1000,
		BurstSize:         10,
	}
}

// RateLimit middleware with Redis backend
func RateLimit(cfg *config.Config) gin.HandlerFunc {
	limits := GetDefaultRateLimits()
	
	return func(c *gin.Context) {
		// Get client identifier (IP or user ID)
		clientID := getClientIdentifier(c)
		
		// Check rate limits
		if isRateLimited(clientID, limits) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded",
				"retry_after": 60,
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// APIRateLimit middleware for API endpoints with stricter limits
func APIRateLimit(cfg *config.Config) gin.HandlerFunc {
	limits := RateLimitConfig{
		RequestsPerMinute: 100,
		RequestsPerHour:   2000,
		BurstSize:         20,
	}
	
	return func(c *gin.Context) {
		clientID := getClientIdentifier(c)
		
		if isRateLimited(clientID, limits) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "API rate limit exceeded",
				"retry_after": 60,
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// WidgetRateLimit middleware for widget endpoints with more lenient limits
func WidgetRateLimit(cfg *config.Config) gin.HandlerFunc {
	limits := RateLimitConfig{
		RequestsPerMinute: 200,
		RequestsPerHour:   5000,
		BurstSize:         50,
	}
	
	return func(c *gin.Context) {
		clientID := getClientIdentifier(c)
		
		if isRateLimited(clientID, limits) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Widget rate limit exceeded",
				"retry_after": 60,
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// getClientIdentifier returns client identifier for rate limiting
func getClientIdentifier(c *gin.Context) string {
	// Try to get user ID first
	if userID, exists := c.Get("user_id"); exists {
		return fmt.Sprintf("user:%v", userID)
	}
	
	// Fall back to IP address
	ip := c.ClientIP()
	return fmt.Sprintf("ip:%s", ip)
}

// isRateLimited checks if client is rate limited
func isRateLimited(clientID string, limits RateLimitConfig) bool {
	// Check minute limit
	minuteKey := fmt.Sprintf("rate_limit:minute:%s", clientID)
	minuteCount, err := redis.Incr(minuteKey)
	if err != nil {
		// If Redis is down, allow request but log error
		return false
	}
	
	if minuteCount == 1 {
		redis.Expire(minuteKey, time.Minute)
	}
	
	if minuteCount > int64(limits.RequestsPerMinute) {
		return true
	}
	
	// Check hour limit
	hourKey := fmt.Sprintf("rate_limit:hour:%s", clientID)
	hourCount, err := redis.Incr(hourKey)
	if err != nil {
		return false
	}
	
	if hourCount == 1 {
		redis.Expire(hourKey, time.Hour)
	}
	
	if hourCount > int64(limits.RequestsPerHour) {
		return true
	}
	
	return false
}

// SecurityHeaders middleware adds security headers
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Prevent MIME type sniffing
		c.Header("X-Content-Type-Options", "nosniff")
		
		// Prevent clickjacking
		c.Header("X-Frame-Options", "DENY")
		
		// XSS protection
		c.Header("X-XSS-Protection", "1; mode=block")
		
		// Referrer policy
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		
		// Content Security Policy
		csp := "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' ws: wss:;"
		c.Header("Content-Security-Policy", csp)
		
		// HSTS (only for HTTPS)
		if c.Request.TLS != nil {
			c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}
		
		c.Next()
	}
}

// RequestSizeLimit middleware limits request body size
func RequestSizeLimit(maxSize int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.ContentLength > maxSize {
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{
				"error": "Request body too large",
				"max_size": maxSize,
			})
			c.Abort()
			return
		}
		
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxSize)
		c.Next()
	}
}

// IPWhitelist middleware allows only whitelisted IPs
func IPWhitelist(allowedIPs []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		
		for _, allowedIP := range allowedIPs {
			if clientIP == allowedIP {
				c.Next()
				return
			}
		}
		
		c.JSON(http.StatusForbidden, gin.H{
			"error": "IP not allowed",
		})
		c.Abort()
	}
}

// ValidateContentType middleware validates request content type
func ValidateContentType(allowedTypes ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == "GET" || c.Request.Method == "DELETE" {
			c.Next()
			return
		}
		
		contentType := c.GetHeader("Content-Type")
		if contentType == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Content-Type header required",
			})
			c.Abort()
			return
		}
		
		for _, allowedType := range allowedTypes {
			if strings.Contains(contentType, allowedType) {
				c.Next()
				return
			}
		}
		
		c.JSON(http.StatusUnsupportedMediaType, gin.H{
			"error": "Unsupported content type",
			"allowed_types": allowedTypes,
		})
		c.Abort()
	}
}

// RequestID middleware adds unique request ID
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}
		
		c.Header("X-Request-ID", requestID)
		c.Set("request_id", requestID)
		c.Next()
	}
}

// generateRequestID generates a unique request ID
func generateRequestID() string {
	return fmt.Sprintf("%d-%d", time.Now().UnixNano(), time.Now().Unix())
}

// WebsiteAuth middleware for widget endpoints
func WebsiteAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		widgetKey := c.Param("widget_key")
		if widgetKey == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Widget key required"})
			c.Abort()
			return
		}

		// TODO: Validate widget key and get website info
		// Store website info in context
		c.Set("widget_key", widgetKey)
		c.Next()
	}
}

// AdminAuth middleware for admin endpoints
func AdminAuth(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// First check if user is authenticated
		authHeader := c.GetHeader("Authorization")
		
		tokenString, err := utils.ExtractTokenFromHeader(authHeader)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		claims, err := utils.ValidateAccessToken(tokenString, cfg)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Check if user has admin privileges
		// TODO: Implement admin role checking
		if claims.Plan != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("plan", claims.Plan)
		c.Next()
	}
}

// BruteForceProtection middleware protects against brute force attacks
func BruteForceProtection(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only apply to login endpoints
		if !strings.Contains(c.Request.URL.Path, "/auth/login") {
			c.Next()
			return
		}
		
		clientIP := c.ClientIP()
		key := fmt.Sprintf("brute_force:%s", clientIP)
		
		// Check failed attempts
		attemptsStr, err := redis.Get(key)
		if err != nil && err.Error() != "redis: nil" {
			// Redis error, allow request
			c.Next()
			return
		}
		
		attempts := 0
		if attemptsStr != "" {
			attempts, _ = strconv.Atoi(attemptsStr)
		}
		
		// Block if too many attempts
		if attempts >= 5 {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many failed login attempts",
				"retry_after": 900, // 15 minutes
			})
			c.Abort()
			return
		}
		
		c.Next()
		
		// Check if login failed (status 401)
		if c.Writer.Status() == http.StatusUnauthorized {
			attempts++
			redis.Set(key, attempts, 15*time.Minute)
		} else if c.Writer.Status() == http.StatusOK {
			// Successful login, reset counter
			redis.Del(key)
		}
	}
}