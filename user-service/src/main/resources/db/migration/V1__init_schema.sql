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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes cho performance
CREATE INDEX idx_account_email ON account(email);
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
