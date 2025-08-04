package models

import (
	"fmt"
	"testing"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Migrate the schema
	db.AutoMigrate(&User{}, &Website{})
	return db
}

func TestUser_HashPassword(t *testing.T) {
	user := &User{}

	tests := []struct {
		name     string
		password string
		wantErr  bool
	}{
		{
			name:     "valid password",
			password: "TestPass123!",
			wantErr:  false,
		},
		{
			name:     "password too short",
			password: "Test1!",
			wantErr:  true,
		},
		{
			name:     "password without uppercase",
			password: "testpass123!",
			wantErr:  true,
		},
		{
			name:     "password without lowercase",
			password: "TESTPASS123!",
			wantErr:  true,
		},
		{
			name:     "password without digit",
			password: "TestPass!",
			wantErr:  true,
		},
		{
			name:     "password without special character",
			password: "TestPass123",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := user.HashPassword(tt.password)
			if (err != nil) != tt.wantErr {
				t.Errorf("User.HashPassword() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr {
				// Verify password was hashed
				if len(user.Password) < 60 {
					t.Errorf("Password was not properly hashed")
				}

				// Verify it's a valid bcrypt hash
				err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(tt.password))
				if err != nil {
					t.Errorf("Hashed password does not match original password")
				}
			}
		})
	}
}

func TestUser_CheckPassword(t *testing.T) {
	user := &User{}
	password := "TestPass123!"
	
	// Hash the password first
	err := user.HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	tests := []struct {
		name     string
		password string
		want     bool
	}{
		{
			name:     "correct password",
			password: "TestPass123!",
			want:     true,
		},
		{
			name:     "incorrect password",
			password: "WrongPass123!",
			want:     false,
		},
		{
			name:     "empty password",
			password: "",
			want:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := user.CheckPassword(tt.password); got != tt.want {
				t.Errorf("User.CheckPassword() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestUser_ToResponse(t *testing.T) {
	user := &User{
		ID:       1,
		Email:    "test@example.com",
		Name:     "Test User",
		Plan:     "pro",
		IsActive: true,
	}

	response := user.ToResponse()

	if response.ID != user.ID {
		t.Errorf("ToResponse() ID = %v, want %v", response.ID, user.ID)
	}
	if response.Email != user.Email {
		t.Errorf("ToResponse() Email = %v, want %v", response.Email, user.Email)
	}
	if response.Name != user.Name {
		t.Errorf("ToResponse() Name = %v, want %v", response.Name, user.Name)
	}
	if response.Plan != user.Plan {
		t.Errorf("ToResponse() Plan = %v, want %v", response.Plan, user.Plan)
	}
	if response.IsActive != user.IsActive {
		t.Errorf("ToResponse() IsActive = %v, want %v", response.IsActive, user.IsActive)
	}
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name    string
		email   string
		wantErr bool
	}{
		{
			name:    "valid email",
			email:   "test@example.com",
			wantErr: false,
		},
		{
			name:    "valid email with subdomain",
			email:   "user@mail.example.com",
			wantErr: false,
		},
		{
			name:    "valid email with plus",
			email:   "user+tag@example.com",
			wantErr: false,
		},
		{
			name:    "empty email",
			email:   "",
			wantErr: true,
		},
		{
			name:    "invalid email without @",
			email:   "testexample.com",
			wantErr: true,
		},
		{
			name:    "invalid email without domain",
			email:   "test@",
			wantErr: true,
		},
		{
			name:    "invalid email without TLD",
			email:   "test@example",
			wantErr: true,
		},
		{
			name:    "invalid email with spaces",
			email:   "test @example.com",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateEmail(tt.email)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateEmail() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidatePassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		wantErr  bool
	}{
		{
			name:     "valid password",
			password: "TestPass123!",
			wantErr:  false,
		},
		{
			name:     "valid password with different special chars",
			password: "MyP@ssw0rd#",
			wantErr:  false,
		},
		{
			name:     "password too short",
			password: "Test1!",
			wantErr:  true,
		},
		{
			name:     "password too long",
			password: "ThisPasswordIsWayTooLongAndExceedsTheMaximumLengthOf128CharactersWhichShouldCauseValidationToFailBecauseItIsNotReasonableToHavePasswordsThisLongInAnySystemBecauseItWouldBeImpractical!",
			wantErr:  true,
		},
		{
			name:     "password without uppercase",
			password: "testpass123!",
			wantErr:  true,
		},
		{
			name:     "password without lowercase",
			password: "TESTPASS123!",
			wantErr:  true,
		},
		{
			name:     "password without digit",
			password: "TestPass!",
			wantErr:  true,
		},
		{
			name:     "password without special character",
			password: "TestPass123",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidatePassword(tt.password)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidatePassword() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestUser_GetPlanLimits(t *testing.T) {
	tests := []struct {
		name string
		plan string
		want PlanLimits
	}{
		{
			name: "free plan",
			plan: "free",
			want: GetPlanLimits("free"),
		},
		{
			name: "starter plan",
			plan: "starter",
			want: GetPlanLimits("starter"),
		},
		{
			name: "pro plan",
			plan: "pro",
			want: GetPlanLimits("pro"),
		},
		{
			name: "pro_max plan",
			plan: "pro_max",
			want: GetPlanLimits("pro_max"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := &User{Plan: tt.plan}
			got := user.GetPlanLimits()
			if got.Plan != tt.want.Plan {
				t.Errorf("User.GetPlanLimits() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestUser_CanCreateWebsite(t *testing.T) {
	db := setupTestDB()

	// Create a user with starter plan (max 3 websites)
	user := &User{
		Email: "test@example.com",
		Name:  "Test User",
		Plan:  "starter",
	}
	err := user.HashPassword("TestPass123!")
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}
	result := db.Create(user)
	if result.Error != nil {
		t.Fatalf("Failed to create user: %v", result.Error)
	}

	// Test when user has no websites
	canCreate, err := user.CanCreateWebsite(db)
	if err != nil {
		t.Fatalf("CanCreateWebsite() error = %v", err)
	}
	if !canCreate {
		t.Errorf("CanCreateWebsite() = %v, want %v", canCreate, true)
	}

	// Create 3 websites for the user (starter plan limit)
	for i := 0; i < 3; i++ {
		website := &Website{
			UserID:   user.ID,
			Name:     fmt.Sprintf("Test Website %d", i+1),
			Domain:   fmt.Sprintf("example%d.com", i+1),
			Settings: GetDefaultWebsiteSettings(),
		}
		// Let BeforeCreate generate the widget key
		result := db.Create(website)
		if result.Error != nil {
			t.Fatalf("Failed to create website: %v", result.Error)
		}
	}

	// Test when user has reached the limit
	canCreate, err = user.CanCreateWebsite(db)
	if err != nil {
		t.Fatalf("CanCreateWebsite() error = %v", err)
	}
	if canCreate {
		t.Errorf("CanCreateWebsite() = %v, want %v", canCreate, false)
	}

	// Test with pro_max plan (unlimited)
	user.Plan = "pro_max"
	db.Save(user)

	canCreate, err = user.CanCreateWebsite(db)
	if err != nil {
		t.Fatalf("CanCreateWebsite() error = %v", err)
	}
	if !canCreate {
		t.Errorf("CanCreateWebsite() with pro_max plan = %v, want %v", canCreate, true)
	}
}

func TestIsEmailTaken(t *testing.T) {
	db := setupTestDB()

	// Create a user
	user := &User{
		Email: "test@example.com",
		Name:  "Test User",
		Plan:  "free",
	}
	err := user.HashPassword("TestPass123!")
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}
	result := db.Create(user)
	if result.Error != nil {
		t.Fatalf("Failed to create user: %v", result.Error)
	}

	// Test with existing email
	taken, err := IsEmailTaken(db, "test@example.com")
	if err != nil {
		t.Fatalf("IsEmailTaken() error = %v", err)
	}
	if !taken {
		t.Errorf("IsEmailTaken() = %v, want %v", taken, true)
	}

	// Test with non-existing email
	taken, err = IsEmailTaken(db, "nonexistent@example.com")
	if err != nil {
		t.Fatalf("IsEmailTaken() error = %v", err)
	}
	if taken {
		t.Errorf("IsEmailTaken() = %v, want %v", taken, false)
	}

	// Test excluding current user
	taken, err = IsEmailTaken(db, "test@example.com", user.ID)
	if err != nil {
		t.Fatalf("IsEmailTaken() error = %v", err)
	}
	if taken {
		t.Errorf("IsEmailTaken() with exclusion = %v, want %v", taken, false)
	}
}