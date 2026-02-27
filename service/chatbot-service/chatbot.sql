CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE event_vector_chunk (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    source_event_uuid UUID NOT NULL, 
    
    -- Đoạn văn bản sẽ được dùng để tạo Prompt cho Gemini
    chunk_text TEXT NOT NULL, 
    
    -- Vector embedding (1536 là kích thước thường dùng cho mô hình text-embedding-004)
    embedding bytea NOT NULL, 
    
    -- Các trường metadata để lọc nhanh trước khi tìm kiếm vector
    category VARCHAR(100), 
    status VARCHAR(10),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON event_vector_chunk USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 1000);