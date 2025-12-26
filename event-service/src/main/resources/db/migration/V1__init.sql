CREATE TABLE event
(
    uuid                 UUID                        NOT NULL,
    current_version_uuid UUID                        NOT NULL,
    status               VARCHAR(255),
    visibility           VARCHAR(255),
    max_participants     INTEGER,
    current_participants INTEGER                     NOT NULL,
    created_by           UUID                        NOT NULL,
    published_by         UUID,
    published_at         TIMESTAMP WITHOUT TIME ZONE,
    accepted_by          UUID,
    accepted_at          TIMESTAMP WITHOUT TIME ZONE,
    created_at           TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at           TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    deleted_at           TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_event PRIMARY KEY (uuid)
);

CREATE TABLE event_content
(
    uuid                  UUID                        NOT NULL,
    event_uuid            UUID                        NOT NULL,
    previous_version_uuid UUID,
    title                 VARCHAR(255)                NOT NULL,
    description           TEXT                        NOT NULL,
    location              VARCHAR(255)                NOT NULL,
    city                  VARCHAR(255)                NOT NULL,
    category              VARCHAR(255)                NOT NULL,
    country_code          VARCHAR(255)                NOT NULL,
    start_time            TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time              TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    image_urls            TEXT[],
    cohost_uuids          UUID[],
    edited_by             UUID                        NOT NULL,
    is_current_version    BOOLEAN                     NOT NULL,
    created_at            TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    price                 DECIMAL(10, 2),
    currency              VARCHAR(3),
    CONSTRAINT pk_event_content PRIMARY KEY (uuid)
);

CREATE TABLE event_feedback
(
    uuid                 UUID     NOT NULL,
    event_uuid           UUID     NOT NULL,
    user_uuid            UUID     NOT NULL,
    rating               SMALLINT NOT NULL,
    comment              TEXT     NOT NULL,
    sentiment            VARCHAR(10),
    sentiment_confidence DECIMAL(4, 3),
    tags                 TEXT[],
    helpful_count        INTEGER,
    created_at           TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_event_feedback PRIMARY KEY (uuid)
);

CREATE TABLE event_interest
(
    uuid       UUID NOT NULL,
    event_uuid UUID NOT NULL,
    user_uuid  UUID NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_event_interest PRIMARY KEY (uuid)
);

CREATE TABLE event_registration
(
    uuid                     UUID NOT NULL,
    event_uuid               UUID,
    user_uuid                UUID,
    registration_status      VARCHAR(255),
    registration_notes       TEXT,
    check_in_time            TIMESTAMP WITHOUT TIME ZONE,
    check_out_time           TIMESTAMP WITHOUT TIME ZONE,
    ticket_price             DECIMAL(10, 2),
    currency                 VARCHAR(3),
    payment_transaction_uuid UUID,
    created_at               TIMESTAMP WITHOUT TIME ZONE,
    updated_at               TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_event_registration PRIMARY KEY (uuid)
);

ALTER TABLE event_interest
    ADD CONSTRAINT uk_event_interest_event_user UNIQUE (event_uuid, user_uuid);