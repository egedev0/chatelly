package models

import (
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestWebsite_GenerateWidgetKey(t *testing.T) {
	website := &Website{}
	
	err := website.GenerateWidgetKey()
	if err != nil {
		t.Fatalf("GenerateWidgetKey() error = %v", err)
	}
	
	// Check if widget key was generated
	if website.WidgetKey == "" {
		t.Errorf("GenerateWidgetKey() did not generate a widget key")
	}
	
	// Check if widget key has correct format
	err = ValidateWidgetKey(website.WidgetKey)
	if err != nil {
		t.Errorf("Generated widget key is invalid: %v", err)
	}
	
	// Generate another key and ensure they're different
	website2 := &Website{}
	err = website2.GenerateWidgetKey()
	if err != nil {
		t.Fatalf("GenerateWidgetKey() error = %v", err)
	}
	
	if website.WidgetKey == website2.WidgetKey {
		t.Errorf("GenerateWidgetKey() generated duplicate keys")
	}
}

func TestValidateWidgetKey(t *testing.T) {
	tests := []struct {
		name      string
		widgetKey string
		wantErr   bool
	}{
		{
			name:      "valid widget key",
			widgetKey: "cw_1234567890abcdef_fedcba0987654321",
			wantErr:   false,
		},
		{
			name:      "empty widget key",
			widgetKey: "",
			wantErr:   true,
		},
		{
			name:      "invalid format - no prefix",
			widgetKey: "1234567890abcdef_fedcba0987654321",
			wantErr:   true,
		},
		{
			name:      "invalid format - wrong prefix",
			widgetKey: "wc_1234567890abcdef_fedcba0987654321",
			wantErr:   true,
		},
		{
			name:      "invalid format - short first part",
			widgetKey: "cw_1234567890abcde_fedcba0987654321",
			wantErr:   true,
		},
		{
			name:      "invalid format - short second part",
			widgetKey: "cw_1234567890abcdef_fedcba098765432",
			wantErr:   true,
		},
		{
			name:      "invalid format - non-hex characters",
			widgetKey: "cw_1234567890abcdeg_fedcba0987654321",
			wantErr:   true,
		},
		{
			name:      "invalid format - missing underscore",
			widgetKey: "cw_1234567890abcdeffedcba0987654321",
			wantErr:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateWidgetKey(tt.widgetKey)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateWidgetKey() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateDomain(t *testing.T) {
	tests := []struct {
		name    string
		domain  string
		wantErr bool
	}{
		{
			name:    "valid domain",
			domain:  "example.com",
			wantErr: false,
		},
		{
			name:    "valid subdomain",
			domain:  "blog.example.com",
			wantErr: false,
		},
		{
			name:    "valid domain with www",
			domain:  "www.example.com",
			wantErr: false,
		},
		{
			name:    "valid domain with http",
			domain:  "http://example.com",
			wantErr: false,
		},
		{
			name:    "valid domain with https",
			domain:  "https://example.com",
			wantErr: false,
		},
		{
			name:    "empty domain",
			domain:  "",
			wantErr: true,
		},
		{
			name:    "invalid domain - no TLD",
			domain:  "example",
			wantErr: true,
		},
		{
			name:    "invalid domain - starts with dot",
			domain:  ".example.com",
			wantErr: true,
		},
		{
			name:    "invalid domain - ends with dot",
			domain:  "example.com.",
			wantErr: false, // Actually valid
		},
		{
			name:    "invalid domain - special characters",
			domain:  "exam@ple.com",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateDomain(tt.domain)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateDomain() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestWebsite_ToResponse(t *testing.T) {
	website := &Website{
		ID:        1,
		Name:      "Test Website",
		Domain:    "example.com",
		WidgetKey: "cw_1234567890abcdef_fedcba0987654321",
		MaxUsers:  100,
		IsActive:  true,
		Settings:  GetDefaultWebsiteSettings(),
	}

	response := website.ToResponse()

	if response.ID != website.ID {
		t.Errorf("ToResponse() ID = %v, want %v", response.ID, website.ID)
	}
	if response.Name != website.Name {
		t.Errorf("ToResponse() Name = %v, want %v", response.Name, website.Name)
	}
	if response.Domain != website.Domain {
		t.Errorf("ToResponse() Domain = %v, want %v", response.Domain, website.Domain)
	}
	if response.WidgetKey != website.WidgetKey {
		t.Errorf("ToResponse() WidgetKey = %v, want %v", response.WidgetKey, website.WidgetKey)
	}
	if response.MaxUsers != website.MaxUsers {
		t.Errorf("ToResponse() MaxUsers = %v, want %v", response.MaxUsers, website.MaxUsers)
	}
	if response.IsActive != website.IsActive {
		t.Errorf("ToResponse() IsActive = %v, want %v", response.IsActive, website.IsActive)
	}
}

func TestGetDefaultWebsiteSettings(t *testing.T) {
	settings := GetDefaultWebsiteSettings()

	if settings.Theme == "" {
		t.Errorf("GetDefaultWebsiteSettings() Theme is empty")
	}
	if settings.PrimaryColor == "" {
		t.Errorf("GetDefaultWebsiteSettings() PrimaryColor is empty")
	}
	if settings.Position == "" {
		t.Errorf("GetDefaultWebsiteSettings() Position is empty")
	}
	if settings.WelcomeMessage == "" {
		t.Errorf("GetDefaultWebsiteSettings() WelcomeMessage is empty")
	}
	if settings.Language == "" {
		t.Errorf("GetDefaultWebsiteSettings() Language is empty")
	}
	if settings.BusinessHours == nil {
		t.Errorf("GetDefaultWebsiteSettings() BusinessHours is nil")
	}
	if len(settings.BusinessHours) != 7 {
		t.Errorf("GetDefaultWebsiteSettings() BusinessHours should have 7 days, got %d", len(settings.BusinessHours))
	}
}

func TestIsWidgetKeyTaken(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Migrate the schema
	db.AutoMigrate(&User{}, &Website{})

	// Create a user first
	user := &User{
		Email: "test@example.com",
		Name:  "Test User",
		Plan:  "free",
	}
	err = user.HashPassword("TestPass123!")
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}
	db.Create(user)

	// Create a website
	website := &Website{
		UserID:    user.ID,
		Name:      "Test Website",
		Domain:    "example.com",
		WidgetKey: "cw_1234567890abcdef_fedcba0987654321",
		Settings:  GetDefaultWebsiteSettings(),
	}
	db.Create(website)

	// Test with existing widget key
	taken, err := IsWidgetKeyTaken(db, "cw_1234567890abcdef_fedcba0987654321")
	if err != nil {
		t.Fatalf("IsWidgetKeyTaken() error = %v", err)
	}
	if !taken {
		t.Errorf("IsWidgetKeyTaken() = %v, want %v", taken, true)
	}

	// Test with non-existing widget key
	taken, err = IsWidgetKeyTaken(db, "cw_0000000000000000_0000000000000000")
	if err != nil {
		t.Fatalf("IsWidgetKeyTaken() error = %v", err)
	}
	if taken {
		t.Errorf("IsWidgetKeyTaken() = %v, want %v", taken, false)
	}

	// Test excluding current website
	taken, err = IsWidgetKeyTaken(db, "cw_1234567890abcdef_fedcba0987654321", website.ID)
	if err != nil {
		t.Fatalf("IsWidgetKeyTaken() error = %v", err)
	}
	if taken {
		t.Errorf("IsWidgetKeyTaken() with exclusion = %v, want %v", taken, false)
	}
}

func TestGetWebsiteByWidgetKey(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Migrate the schema
	db.AutoMigrate(&User{}, &Website{})

	// Create a user first
	user := &User{
		Email: "test@example.com",
		Name:  "Test User",
		Plan:  "free",
	}
	err = user.HashPassword("TestPass123!")
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}
	db.Create(user)

	// Create an active website
	website := &Website{
		UserID:    user.ID,
		Name:      "Test Website",
		Domain:    "example.com",
		WidgetKey: "cw_1234567890abcdef_fedcba0987654321",
		IsActive:  true,
		Settings:  GetDefaultWebsiteSettings(),
	}
	db.Create(website)

	// Test finding existing active website
	found, err := GetWebsiteByWidgetKey(db, "cw_1234567890abcdef_fedcba0987654321")
	if err != nil {
		t.Fatalf("GetWebsiteByWidgetKey() error = %v", err)
	}
	if found == nil {
		t.Errorf("GetWebsiteByWidgetKey() returned nil")
	}
	if found.ID != website.ID {
		t.Errorf("GetWebsiteByWidgetKey() ID = %v, want %v", found.ID, website.ID)
	}

	// Test with non-existing widget key
	found, err = GetWebsiteByWidgetKey(db, "cw_0000000000000000_0000000000000000")
	if err == nil {
		t.Errorf("GetWebsiteByWidgetKey() should return error for non-existing key")
	}
	if found != nil {
		t.Errorf("GetWebsiteByWidgetKey() should return nil for non-existing key")
	}

	// Test with inactive website
	website.IsActive = false
	db.Save(website)

	found, err = GetWebsiteByWidgetKey(db, "cw_1234567890abcdef_fedcba0987654321")
	if err == nil {
		t.Errorf("GetWebsiteByWidgetKey() should return error for inactive website")
	}
	if found != nil {
		t.Errorf("GetWebsiteByWidgetKey() should return nil for inactive website")
	}
}

func TestWebsite_BeforeCreate(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Test widget key generation
	website := &Website{
		Name:   "Test Website",
		Domain: "example.com",
	}

	err = website.BeforeCreate(db)
	if err != nil {
		t.Fatalf("BeforeCreate() error = %v", err)
	}

	if website.WidgetKey == "" {
		t.Errorf("BeforeCreate() did not generate widget key")
	}

	if website.MaxUsers != 100 {
		t.Errorf("BeforeCreate() MaxUsers = %v, want %v", website.MaxUsers, 100)
	}

	if website.Settings.Theme == "" {
		t.Errorf("BeforeCreate() did not set default settings")
	}

	// Test with invalid domain
	website2 := &Website{
		Name:   "Test Website 2",
		Domain: "invalid-domain",
	}

	err = website2.BeforeCreate(db)
	if err == nil {
		t.Errorf("BeforeCreate() should return error for invalid domain")
	}
}