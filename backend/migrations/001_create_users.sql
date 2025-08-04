-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Add constraints
ALTER TABLE users ADD CONSTRAINT chk_users_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users ADD CONSTRAINT chk_users_plan_valid 
    CHECK (plan IN ('free', 'starter', 'pro', 'pro_max'));

ALTER TABLE users ADD CONSTRAINT chk_users_name_length 
    CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON COLUMN users.id IS 'Primary key, auto-incrementing user ID';
COMMENT ON COLUMN users.email IS 'User email address, must be unique';
COMMENT ON COLUMN users.password IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.name IS 'User full name or display name';
COMMENT ON COLUMN users.plan IS 'Subscription plan: free, starter, pro, pro_max';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN users.created_at IS 'Timestamp when user was created';
COMMENT ON COLUMN users.updated_at IS 'Timestamp when user was last updated';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp, NULL if not deleted';