-- Add Users Table for JWT Authentication
-- This migration adds the users table for authentication

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    roles VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Index for Username Lookups
CREATE INDEX idx_users_username ON users(username);

-- Insert Default Admin User (password: admin123)
-- BCrypt hash for 'admin123'
INSERT INTO users (id, username, password, roles, enabled)
VALUES (
    gen_random_uuid(),
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN,EMPLOYEE',
    true
) ON CONFLICT (username) DO NOTHING;

-- Insert Default Employee User (password: employee123)
INSERT INTO users (id, username, password, roles, enabled)
VALUES (
    gen_random_uuid(),
    'employee',
    '$2a$10$8cjz47bjbR4Mn8GMg9IZx.vyjhLXR/SKKMSZ9.mP9vpMu0ssKi8GW',
    'EMPLOYEE',
    true
) ON CONFLICT (username) DO NOTHING;
