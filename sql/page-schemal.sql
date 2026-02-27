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