-- CREATE EXTENSION IF NOT EXISTS pg_uuidv7;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- uuidv7 func
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
LANGUAGE sql
AS $$
  -- UUIDv7: 48-bit unix_ts_ms + version (7) + variant (10) + 80-bit random
  SELECT (
    lpad(to_hex(floor(extract(epoch from clock_timestamp()) * 1000)::bigint), 12, '0') ||
    lpad(to_hex((get_byte(v, 0) & 15) | 112), 2, '0') ||  -- set version 0x7?
    lpad(to_hex(get_byte(v, 1)), 2, '0') ||
    lpad(to_hex(get_byte(v, 2)), 2, '0') ||
    lpad(to_hex((get_byte(v, 3) & 63) | 128), 2, '0') ||  -- set variant 0b10xxxxxx
    lpad(to_hex(get_byte(v, 4)), 2, '0') ||
    lpad(to_hex(get_byte(v, 5)), 2, '0') ||
    lpad(to_hex(get_byte(v, 6)), 2, '0') ||
    lpad(to_hex(get_byte(v, 7)), 2, '0') ||
    lpad(to_hex(get_byte(v, 8)), 2, '0')
  )::uuid
  FROM (SELECT gen_random_bytes(10) v) g;
$$;

-- =========================
-- USER-SERVICE SCHEMA
-- =========================

-- Core account - Single source of truth cho identity
CREATE TABLE account (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
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

CREATE TABLE account_disable (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
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
    permissions JSONB, -- JSONB thay vì TEXT
    CONSTRAINT fk_admin_account FOREIGN KEY (account_uuid) REFERENCES account(uuid) ON DELETE CASCADE
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
    social_links JSONB, -- facebook, twitter, ...
    preferences JSONB, -- Notification settings, timezone
    privacy_settings JSONB, -- Profile visibility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- CONSTRAINT fk_profile_account FOREIGN KEY (account_uuid) REFERENCES account(uuid) ON DELETE CASCADE
);

-- Indexes cho performance
CREATE INDEX idx_account_email ON account(email);
CREATE INDEX idx_account_active ON account(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_profile_country ON user_profile(country_code);
CREATE INDEX idx_user_profile_city ON user_profile(city);

-- Audit log cho security-critical operations
CREATE TABLE account_audit_log (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
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
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
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
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
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
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
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
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    page_uuid UUID NOT NULL,
    user_uuid UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- PAGE_CREATED, MEMBER_ADDED, etc.
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- EVENT-SERVICE SCHEMA
-- =========================

-- Event core entity - chỉ chứa metadata
CREATE TABLE event (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    current_version_uuid UUID NOT NULL,
    status VARCHAR(10) DEFAULT 'DRAFT', -- DRAFT -> PENDING -> PUBLISHED
    visibility VARCHAR(10) DEFAULT 'PUBLIC', -- PUBLIC, PRIVATE, UNLISTED
    max_participants INTEGER CHECK (max_participants IS NULL OR max_participants > 0),
    current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
    created_by UUID NOT NULL, -- User UUID
    published_by UUID, -- Admin UUID
    published_at TIMESTAMP,
    accepted_by UUID, -- Admin UUID
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT check_status CHECK (status IN ('DRAFT', 'PENDING', 'REJECTED', 'PUBLISHED', 'CANCELLED')),
    CONSTRAINT check_visibility CHECK (visibility IN ('PUBLIC', 'PRIVATE', 'UNLISTED')),
    CONSTRAINT check_participants CHECK (current_participants <= max_participants OR max_participants IS NULL)
);

-- Event content versioning
CREATE TABLE event_content (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    event_uuid UUID NOT NULL,
    previous_version_uuid UUID, -- Self-referencing
    title VARCHAR(255) NOT NULL CHECK (LENGTH(title) >= 5),
    description TEXT NOT NULL CHECK (LENGTH(description) >= 10),
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL CHECK (end_time > start_time),
    image_urls TEXT[], -- Multiple images
    cohost_uuids UUID[], -- Array of user UUIDs
    edited_by UUID NOT NULL, -- User UUID
    is_current_version BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	price NUMERIC(10,2),
	currency VARCHAR(3),
    CONSTRAINT fk_content_event FOREIGN KEY (event_uuid) REFERENCES event(uuid) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_previous_version FOREIGN KEY (previous_version_uuid) REFERENCES event_content(uuid) DEFERRABLE INITIALLY DEFERRED,
);

-- Thêm FK từ event.current_version_uuid → event_content.uuid sau khi cả 2 bảng đã tồn tại

ALTER TABLE event ADD CONSTRAINT fk_current_version_uuid FOREIGN KEY (current_version_uuid) REFERENCES event_content(uuid);

-- Event feedback
CREATE TABLE event_feedback (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    event_uuid UUID NOT NULL,
    user_uuid UUID NOT NULL, -- NO FK!
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT CHECK (LENGTH(comment) <= 1000),
    sentiment VARCHAR(10), -- POSITIVE, NEUTRAL, NEGATIVE
    sentiment_confidence DECIMAL(4,3) CHECK (sentiment_confidence IS NULL OR (sentiment_confidence >= 0.000 AND sentiment_confidence <= 1.000)),
    tags TEXT[], -- Pre-defined feedback tags
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_feedback UNIQUE(event_uuid, user_uuid)
);

-- Event analytics (materialized)
CREATE TABLE event_analytics (
    event_uuid UUID PRIMARY KEY,
    total_views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    page_likes_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2),
    sentiment_distribution JSONB,
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance

-- event: danh sách public đã publish, chưa xóa, sắp theo thời gian
CREATE INDEX IF NOT EXISTS event_published_public_idx
  ON event(published_at DESC)
  WHERE status = 'PUBLISHED' AND visibility = 'PUBLIC' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_event_original_uuid  ON event(original_uuid);
CREATE INDEX IF NOT EXISTS idx_event_created_by     ON event(created_by);
CREATE INDEX IF NOT EXISTS idx_event_status_visibility ON event(status, visibility);

-- event_content: thời gian/tìm kiếm/versioning
CREATE INDEX IF NOT EXISTS idx_event_content_start_time ON event_content(start_time);
CREATE INDEX IF NOT EXISTS idx_event_content_end_time   ON event_content(end_time);
CREATE INDEX IF NOT EXISTS idx_event_content_city       ON event_content(city);
CREATE INDEX IF NOT EXISTS idx_event_content_category   ON event_content(category);

-- Unique partial: mỗi event chỉ có 1 bản current
CREATE UNIQUE INDEX IF NOT EXISTS event_content_current_unique
  ON event_content(event_uuid)
  WHERE is_current_version = TRUE;

-- Tăng tốc lấy bản current theo event_uuid
CREATE INDEX IF NOT EXISTS event_content_event_current_idx
  ON event_content(event_uuid)
  WHERE is_current_version = TRUE;

-- Tags array
CREATE INDEX IF NOT EXISTS idx_event_content_tags_gin ON event_content USING GIN (tags);

-- Title ILIKE: chỉ tạo nếu hệ thống có pg_trgm (tránh lỗi khi extension không sẵn)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_trgm') THEN
    PERFORM 1;
    BEGIN
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS idx_event_content_title_trgm ON event_content USING GIN (title gin_trgm_ops);
    EXCEPTION WHEN OTHERS THEN
      -- Bỏ qua nếu không thể tạo extension/index
      NULL;
    END;
  END IF;
END$$;

-- Event registration
CREATE TABLE event_registration (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    event_uuid UUID NOT NULL,
    user_uuid UUID NOT NULL, -- NO FK!
    registration_status VARCHAR(15) DEFAULT 'REGISTERED',
    registration_notes TEXT,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    ticket_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_transaction_uuid UUID, -- Reference to Payment Service
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_registration_status CHECK (registration_status IN ('REGISTERED', 'CANCELLED', 'NO_SHOW', 'ATTENDED', 'REFUNDED')),
    CONSTRAINT check_ticket_price_non_negative CHECK (ticket_price IS NULL OR ticket_price >= 0),
    CONSTRAINT unique_registration UNIQUE(event_uuid, user_uuid)
);

-- event_registration: tra cứu theo event/user và các trạng thái phổ biến
CREATE INDEX IF NOT EXISTS idx_event_reg_event     ON event_registration(event_uuid);
CREATE INDEX IF NOT EXISTS idx_registration_user   ON event_registration(user_uuid);
CREATE INDEX IF NOT EXISTS idx_registration_status ON event_registration(registration_status);

CREATE INDEX IF NOT EXISTS idx_event_reg_waitlist
  ON event_registration (event_uuid, waitlist_position)
  WHERE is_waitlist = TRUE;

CREATE INDEX IF NOT EXISTS event_reg_checkin_idx
  ON event_registration (event_uuid, check_in_status)
  WHERE check_in_status <> 'NOT_CHECKED_IN';

CREATE INDEX IF NOT EXISTS event_reg_payment_idx
  ON event_registration (payment_transaction_uuid);

-- event_feedback: đọc theo event, sắp mới nhất
CREATE INDEX IF NOT EXISTS event_fb_event_created_idx
  ON event_feedback (event_uuid, created_at DESC)
  INCLUDE (rating, helpful_count, sentiment);

CREATE INDEX IF NOT EXISTS idx_event_fb_user ON event_feedback(user_uuid);

-- Triggers tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS set_updated_at_event ON event;
CREATE TRIGGER set_updated_at_event
BEFORE UPDATE ON event
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_event_registration ON event_registration;
CREATE TRIGGER set_updated_at_event_registration
BEFORE UPDATE ON event_registration
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- PAYMENT-SERVICE SCHEMA
-- =========================

CREATE TABLE payment_transaction (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_uuid UUID NOT NULL, -- NO FK!
    event_uuid UUID, -- Optional: for event registration
    registration_uuid UUID, -- Link to Event-Service
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status VARCHAR(20) DEFAULT 'PENDING',
    payment_method VARCHAR(20), -- VNPAY, MOMO, STRIPE, PAYPAL
    gateway_transaction_id VARCHAR(100), -- ID từ payment gateway
    gateway_response JSONB, -- Lưu toàn bộ response
    failure_reason TEXT,
    billing_address JSONB,
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_status CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    CONSTRAINT check_refund CHECK (refund_amount <= amount)
);

-- Payment method storage (PCI-DSS compliant)
CREATE TABLE payment_method (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_uuid UUID NOT NULL, -- NO FK!
    payment_method_type VARCHAR(20) NOT NULL, -- CARD, BANK_ACCOUNT, E_WALLET
    provider VARCHAR(20) NOT NULL, -- VNPAY, MOMO, STRIPE
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    provider_data JSONB, -- Tokenized data, không store sensitive info
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment gateway webhook events
CREATE TABLE payment_webhook_log (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    gateway VARCHAR(20) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_payment_user ON payment_transaction(user_uuid);
CREATE INDEX idx_payment_status ON payment_transaction(status);
CREATE INDEX idx_payment_gateway ON payment_transaction(gateway_transaction_id);
CREATE INDEX idx_payment_event ON payment_transaction(event_uuid);

-- =========================
-- NOTIFICATION-SERVICE SCHEMA
-- =========================

CREATE TABLE notification (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_uuid UUID NOT NULL, -- NO FK!
    type VARCHAR(30) NOT NULL, -- EVENT_PUBLISHED, REGISTRATION_CONFIRMED, PAYMENT_SUCCESS
    priority SMALLINT NOT NULL DEFAULT 1,  -- 0=LOW,1=NORMAL,2=HIGH,3=URGENT
    body TEXT NOT NULL,
    deep_link TEXT,
    image_url TEXT,
    -- is_read BOOLEAN DEFAULT FALSE,
    -- read_at TIMESTAMP,
    -- delivered_at TIMESTAMP,
    -- delivery_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    -- failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE INDEX idx_notif_user_created
  ON notification (user_uuid, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;
  
CREATE INDEX idx_notif_expires
  ON notification (expires_at)
  WHERE expires_at IS NOT NULL;
  
CREATE TABLE notification_read_marker (
  user_uuid        UUID PRIMARY KEY,
  read_all_before  TIMESTAMP NOT NULL DEFAULT 'epoch'::TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_read_receipt (
  user_uuid        uuid NOT NULL,
  notification_id  uuid NOT NULL,
  read_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_uuid, notification_id)
);

CREATE INDEX idx_receipt_user_readat
  ON notification_read_receipt (user_uuid, read_at DESC);

-- User notification preferences
-- CREATE TABLE notification_preference (
--     user_uuid UUID PRIMARY KEY,
--     push_enabled BOOLEAN DEFAULT TRUE,
--     email_enabled BOOLEAN DEFAULT TRUE,
--     sms_enabled BOOLEAN DEFAULT FALSE,
--     quiet_hours JSONB
--     blocked_categories TEXT[] NOT NULL DEFAULT '{}'::text[], -- ['MARKETING', 'SOCIAL']
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Notification device tokens (FCM, APNS)
-- CREATE TABLE notification_device (
--     uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
--     user_uuid UUID NOT NULL, -- NO FK!
--     device_type VARCHAR(10) CHECK (device_type IN ('IOS', 'ANDROID', 'WEB')),
--     device_token TEXT NOT NULL,
--     is_active BOOLEAN DEFAULT TRUE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     CONSTRAINT unique_device_token UNIQUE(device_token)
--);

-- Outbox pattern for reliable event delivery
-- CREATE TABLE notification_outbox (
--     uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
--     event_type VARCHAR(30) NOT NULL,
--     payload JSONB NOT NULL,
--     processed_at TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE INDEX idx_notification_user ON notification(user_uuid, created_at DESC) WHERE is_read = FALSE;
-- CREATE INDEX idx_notification_status ON notification(delivery_status) WHERE delivery_status = 'PENDING';
