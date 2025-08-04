-- Create websites table
CREATE TABLE IF NOT EXISTS websites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    widget_key VARCHAR(255) UNIQUE NOT NULL,
    max_users INTEGER DEFAULT 100 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    settings JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_websites_widget_key ON websites(widget_key) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_websites_domain ON websites(domain) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_websites_is_active ON websites(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_websites_deleted_at ON websites(deleted_at);
CREATE INDEX IF NOT EXISTS idx_websites_created_at ON websites(created_at);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_websites_user_active ON websites(user_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_websites_widget_active ON websites(widget_key, is_active) WHERE deleted_at IS NULL;

-- Add constraints
ALTER TABLE websites ADD CONSTRAINT chk_websites_name_length 
    CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100);

ALTER TABLE websites ADD CONSTRAINT chk_websites_domain_format 
    CHECK (domain ~* '^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$');

ALTER TABLE websites ADD CONSTRAINT chk_websites_widget_key_format 
    CHECK (widget_key ~* '^cw_[a-f0-9]{16}_[a-f0-9]{16}$');

ALTER TABLE websites ADD CONSTRAINT chk_websites_max_users_positive 
    CHECK (max_users > 0 AND max_users <= 10000);

-- Add comments for documentation
COMMENT ON TABLE websites IS 'Stores website information for chat widget integration';
COMMENT ON COLUMN websites.id IS 'Primary key, auto-incrementing website ID';
COMMENT ON COLUMN websites.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN websites.name IS 'Display name of the website';
COMMENT ON COLUMN websites.domain IS 'Domain name of the website';
COMMENT ON COLUMN websites.widget_key IS 'Unique key for widget identification';
COMMENT ON COLUMN websites.max_users IS 'Maximum concurrent users allowed';
COMMENT ON COLUMN websites.is_active IS 'Whether the website is active';
COMMENT ON COLUMN websites.settings IS 'JSONB configuration for widget customization';
COMMENT ON COLUMN websites.created_at IS 'Timestamp when website was created';
COMMENT ON COLUMN websites.updated_at IS 'Timestamp when website was last updated';
COMMENT ON COLUMN websites.deleted_at IS 'Soft delete timestamp, NULL if not deleted';