-- =========================
-- USER-SERVICE SCHEMA
-- =========================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core account - Single source of truth cho identity
CREATE TABLE account (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Argon2id recommended
    role VARCHAR(10) DEFAULT 'USER',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    mfa_secret VARCHAR(32), -- For 2FA
    mfa_enabled BOOLEAN DEFAULT FALSE,
    CONSTRAINT check_role CHECK (role IN ('ADMIN', 'USER'))
);

CREATE TABLE disaccount (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Argon2id recommended
    role VARCHAR(10) DEFAULT 'USER',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    mfa_secret VARCHAR(32), -- For 2FA
    mfa_enabled BOOLEAN DEFAULT FALSE,
    CONSTRAINT check_role CHECK (role IN ('ADMIN', 'USER'))
);

COMMENT ON TABLE account IS 'Centralized identity - Owned exclusively by User-Service';

-- Admin extension (optional, có thể move sang Admin-Service)
CREATE TABLE admin_profile (
    account_uuid UUID PRIMARY KEY,
    department VARCHAR(100),
    permissions JSONB -- JSONB thay vì TEXT
);

-- User profile (separate table để optimize queries)
CREATE TABLE user_profile (
    account_uuid UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(201) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED, -- Computed column
    date_of_birth DATE CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '13 years'), -- Min age 13
    city VARCHAR(100),
    country_code VARCHAR(3), -- ISO 3166-1 alpha-3
    avatar_url VARCHAR(500) CHECK (avatar_url ~ '^https?://'), -- URL validation
    bio TEXT CHECK (LENGTH(bio) <= 500),
    interests JSONB, -- Array of tags
    social_links JSONB, -- {facebook, twitter, ...}
    preferences JSONB, -- Notification settings, timezone
    privacy_settings JSONB, -- Profile visibility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes cho performance
CREATE INDEX idx_account_email ON account(email);
CREATE INDEX idx_user_profile_country ON user_profile(country_code);
CREATE INDEX idx_user_profile_city ON user_profile(city);

-- Audit log cho security-critical operations
CREATE TABLE account_audit_log (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_uuid UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- LOGIN, PASSWORD_CHANGE, EMAIL_CHANGE
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_account ON account_audit_log(account_uuid, created_at DESC);

-- =========================
-- PAGE-SERVICE SCHEMA
-- =========================

-- Page entity (renamed from channel)
CREATE TABLE page (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_uuid UUID NOT NULL, -- NO FK! Store as UUID string
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- SEO-friendly URL
    description TEXT,
    page_type VARCHAR(20) DEFAULT 'PERSONAL', -- RENAME
    avatar_url VARCHAR(500) CHECK (avatar_url ~ '^https?://'),
    cover_image_url VARCHAR(500) CHECK (cover_image_url ~ '^https?://'),
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    follower_count INTEGER DEFAULT 0 CHECK (follower_count >= 0),
    event_count INTEGER DEFAULT 0 CHECK (event_count >= 0),
    status VARCHAR(15) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP, -- Soft delete
    CONSTRAINT check_page_type CHECK (page_type IN ('PERSONAL', 'ORGANIZATION', 'BUSINESS', 'COMMUNITY')),
    CONSTRAINT check_status CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED'))
);

-- Event sourcing: Store owner snapshot để tránh query User-Service
CREATE TABLE page_owner_snapshot (
    page_uuid UUID PRIMARY KEY,
    owner_uuid UUID NOT NULL,
    owner_email VARCHAR(100),
    owner_name VARCHAR(100),
    snapshot_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Page membership (thay vì channel_member)
CREATE TABLE page_member (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_uuid UUID NOT NULL,
    user_uuid UUID NOT NULL, -- NO FK!
    role VARCHAR(15) DEFAULT 'MEMBER',
    permissions JSONB, -- Granular permissions
    invitation_status VARCHAR(15) DEFAULT 'PENDING',
    invited_by UUID, -- UUID string
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    CONSTRAINT check_member_role CHECK (role IN ('OWNER', 'ADMIN', 'MODERATOR', 'EDITOR', 'MEMBER')),
    CONSTRAINT check_invitation_status CHECK (invitation_status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'REMOVED')),
    CONSTRAINT unique_page_member UNIQUE(page_uuid, user_uuid)
);

-- Page followers (thay vì channel_follower)
CREATE TABLE page_follower (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_uuid UUID NOT NULL,
    follower_uuid UUID NOT NULL, -- NO FK!
    notification_enabled BOOLEAN DEFAULT TRUE,
    muted_until TIMESTAMP,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_page_follower UNIQUE(page_uuid, follower_uuid)
);

-- CRITICAL: Materialized view cho follower count (không update real-time)
CREATE MATERIALIZED VIEW page_follower_count AS
SELECT page_uuid, COUNT(*) as count
FROM page_follower
GROUP BY page_uuid;

CREATE UNIQUE INDEX ON page_follower_count(page_uuid);

-- Refresh mỗi giờ
-- REFRESH MATERIALIZED VIEW CONCURRENTLY page_follower_count;

-- Indexes
CREATE INDEX idx_page_owner ON page(owner_uuid);
CREATE INDEX idx_page_slug ON page(slug);
CREATE INDEX idx_page_status ON page(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_page_member_user ON page_member(user_uuid);
CREATE INDEX idx_page_follower_user ON page_follower(follower_uuid);

-- Audit log cho page actions
CREATE TABLE page_audit_log (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_uuid UUID NOT NULL,
    user_uuid UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- PAGE_CREATED, MEMBER_ADDED, etc.
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- NOTIFICATION-SERVICE SCHEMA
-- =========================

CREATE TABLE notification (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_uuid UUID NOT NULL, -- NO FK!
    notification_type VARCHAR(30) NOT NULL, -- EVENT_PUBLISHED, REGISTRATION_CONFIRMED, PAYMENT_SUCCESS
    priority VARCHAR(10) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    deep_link VARCHAR(500), -- app://event/12345
    image_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    delivered_at TIMESTAMP,
    delivery_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- User notification preferences
CREATE TABLE notification_preference (
    user_uuid UUID PRIMARY KEY,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    blocked_categories jsonb, -- ['MARKETING', 'SOCIAL']
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification device tokens (FCM, APNS)
CREATE TABLE notification_device (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_uuid UUID NOT NULL, -- NO FK!
    device_type VARCHAR(10) CHECK (device_type IN ('IOS', 'ANDROID', 'WEB')),
    device_token TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_device_token UNIQUE(device_token)
);

-- Outbox pattern for reliable event delivery
CREATE TABLE notification_outbox (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(30) NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_user ON notification(user_uuid, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_notification_status ON notification(delivery_status) WHERE delivery_status = 'PENDING';