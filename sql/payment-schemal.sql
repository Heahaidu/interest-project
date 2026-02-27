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