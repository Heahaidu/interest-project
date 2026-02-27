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
