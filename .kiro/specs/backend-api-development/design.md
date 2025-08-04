# Backend API Design Document

## Overview

The Chatelly backend API is designed as a RESTful service with WebSocket support for real-time chat functionality. The system follows a clean architecture pattern with clear separation of concerns across configuration, database, handlers, middleware, models, and services layers.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Widget        │    │   Mobile App    │
│   Dashboard     │    │   (Public)      │    │   (Future)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Load Balancer       │
                    │      (Nginx/Traefik)     │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Gin HTTP Server     │
                    │      (Go Backend)        │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
│   PostgreSQL      │  │      Redis        │  │   File Storage    │
│   (Primary DB)    │  │     (Cache)       │  │   (S3/Local)      │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

### Directory Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go                 # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go              # Configuration management
│   ├── database/
│   │   ├── connection.go          # Database connection
│   │   └── migrations.go          # Database migrations
│   ├── handlers/
│   │   ├── auth.go                # Authentication endpoints
│   │   ├── websites.go            # Website management
│   │   ├── chat.go                # Chat functionality
│   │   ├── analytics.go           # Analytics endpoints
│   │   └── widget.go              # Widget configuration
│   ├── middleware/
│   │   ├── auth.go                # JWT authentication
│   │   ├── cors.go                # CORS handling
│   │   ├── logger.go              # Request logging
│   │   └── ratelimit.go           # Rate limiting
│   ├── models/
│   │   ├── user.go                # User model
│   │   ├── website.go             # Website model
│   │   ├── chat.go                # Chat models
│   │   └── analytics.go           # Analytics models
│   └── services/
│       ├── auth.go                # Authentication service
│       ├── website.go             # Website service
│       ├── chat.go                # Chat service
│       └── analytics.go           # Analytics service
├── pkg/
│   ├── websocket/
│   │   ├── hub.go                 # WebSocket hub
│   │   └── client.go              # WebSocket client
│   └── utils/
│       ├── jwt.go                 # JWT utilities
│       └── validation.go          # Validation helpers
└── migrations/
    ├── 001_create_users.sql
    ├── 002_create_websites.sql
    └── 003_create_chats.sql
```

## Components and Interfaces

### 1. Configuration Layer

**Purpose:** Centralized configuration management
**Location:** `internal/config/`

```go
type Config struct {
    Server struct {
        Host string
        Port string
        Env  string
    }
    Database struct {
        Host     string
        Port     string
        User     string
        Password string
        Name     string
        SSLMode  string
    }
    JWT struct {
        Secret         string
        ExpirationTime time.Duration
        RefreshTime    time.Duration
    }
    Redis struct {
        Host     string
        Port     string
        Password string
        DB       int
    }
}
```

### 2. Database Layer

**Purpose:** Database connection and migration management
**Location:** `internal/database/`

**Key Functions:**
- `Connect(cfg *Config) error` - Establish database connection
- `Migrate() error` - Run database migrations
- `GetDB() *gorm.DB` - Get database instance

### 3. Models Layer

**Purpose:** Data models and database schema definitions
**Location:** `internal/models/`

**Core Models:**

```go
type User struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    Email     string    `json:"email" gorm:"unique;not null"`
    Password  string    `json:"-" gorm:"not null"`
    Name      string    `json:"name" gorm:"not null"`
    Plan      string    `json:"plan" gorm:"default:'free'"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
    Websites  []Website `json:"websites,omitempty"`
}

type Website struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    UserID      uint      `json:"user_id" gorm:"not null"`
    Name        string    `json:"name" gorm:"not null"`
    Domain      string    `json:"domain" gorm:"not null"`
    WidgetKey   string    `json:"widget_key" gorm:"unique;not null"`
    MaxUsers    int       `json:"max_users" gorm:"default:100"`
    IsActive    bool      `json:"is_active" gorm:"default:true"`
    Settings    JSON      `json:"settings" gorm:"type:jsonb"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
    User        User      `json:"user,omitempty"`
    Chats       []Chat    `json:"chats,omitempty"`
}

type Chat struct {
    ID         uint      `json:"id" gorm:"primaryKey"`
    WebsiteID  uint      `json:"website_id" gorm:"not null"`
    SessionID  string    `json:"session_id" gorm:"not null"`
    VisitorID  string    `json:"visitor_id"`
    Status     string    `json:"status" gorm:"default:'active'"`
    StartedAt  time.Time `json:"started_at"`
    EndedAt    *time.Time `json:"ended_at,omitempty"`
    Website    Website   `json:"website,omitempty"`
    Messages   []Message `json:"messages,omitempty"`
}

type Message struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    ChatID    uint      `json:"chat_id" gorm:"not null"`
    Content   string    `json:"content" gorm:"not null"`
    Type      string    `json:"type" gorm:"default:'text'"`
    SenderID  string    `json:"sender_id"`
    IsFromBot bool      `json:"is_from_bot" gorm:"default:false"`
    CreatedAt time.Time `json:"created_at"`
    Chat      Chat      `json:"chat,omitempty"`
}
```

### 4. Services Layer

**Purpose:** Business logic implementation
**Location:** `internal/services/`

**Key Services:**
- `AuthService` - User authentication and authorization
- `WebsiteService` - Website CRUD operations
- `ChatService` - Chat management and message handling
- `AnalyticsService` - Data aggregation and metrics

### 5. Handlers Layer

**Purpose:** HTTP request handling and response formatting
**Location:** `internal/handlers/`

**API Endpoints:**

```
Authentication:
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh

User Management:
GET    /api/v1/user/profile
PUT    /api/v1/user/profile

Website Management:
GET    /api/v1/websites
POST   /api/v1/websites
GET    /api/v1/websites/:id
PUT    /api/v1/websites/:id
DELETE /api/v1/websites/:id

Chat Management:
GET    /api/v1/websites/:id/chats
GET    /api/v1/chats/:id/messages
WS     /widget/ws/:widget_key

Widget System:
GET    /widget/config/:widget_key
GET    /widget/script/:widget_key

Analytics:
GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/websites/:id
```

### 6. Middleware Layer

**Purpose:** Request processing and security
**Location:** `internal/middleware/`

**Middleware Components:**
- `AuthRequired()` - JWT token validation
- `CORS()` - Cross-origin resource sharing
- `Logger()` - Request/response logging
- `RateLimit()` - API rate limiting
- `Recovery()` - Panic recovery

### 7. WebSocket System

**Purpose:** Real-time chat functionality
**Location:** `pkg/websocket/`

**Components:**
- `Hub` - Manages WebSocket connections
- `Client` - Individual WebSocket connection
- Message broadcasting and room management

## Data Models

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Websites table
CREATE TABLE websites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    widget_key VARCHAR(255) UNIQUE NOT NULL,
    max_users INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    visitor_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text',
    sender_id VARCHAR(255),
    is_from_bot BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    visitor_id VARCHAR(255),
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

### Error Response Format

```go
type ErrorResponse struct {
    Error   string            `json:"error"`
    Message string            `json:"message"`
    Code    int              `json:"code"`
    Details map[string]string `json:"details,omitempty"`
}
```

### Error Categories

1. **Validation Errors** (400) - Invalid input data
2. **Authentication Errors** (401) - Invalid credentials
3. **Authorization Errors** (403) - Insufficient permissions
4. **Not Found Errors** (404) - Resource not found
5. **Rate Limit Errors** (429) - Too many requests
6. **Server Errors** (500) - Internal server errors

## Testing Strategy

### Unit Testing
- Model validation tests
- Service layer business logic tests
- Utility function tests

### Integration Testing
- API endpoint tests
- Database operation tests
- WebSocket connection tests

### Performance Testing
- Load testing for concurrent users
- Database query optimization
- Memory usage profiling

## Security Considerations

### Authentication & Authorization
- JWT tokens with expiration
- Refresh token rotation
- Role-based access control

### Data Protection
- Password hashing with bcrypt
- SQL injection prevention with GORM
- Input validation and sanitization

### Rate Limiting
- Per-IP rate limiting
- Per-user API limits
- WebSocket connection limits

## Deployment Architecture

### Development Environment
- Local PostgreSQL database
- Redis for caching
- Hot reload with Air

### Production Environment
- Containerized with Docker
- PostgreSQL with connection pooling
- Redis cluster for caching
- Load balancer for scaling
- SSL/TLS termination

## Monitoring and Logging

### Logging Strategy
- Structured logging with logrus
- Request/response logging
- Error tracking and alerting

### Metrics Collection
- API response times
- Database query performance
- WebSocket connection counts
- Error rates and types

### Health Checks
- Database connectivity
- Redis availability
- Memory and CPU usage
- Disk space monitoring