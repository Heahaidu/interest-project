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