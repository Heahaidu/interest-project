package com.aws.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "event_vector_chunk")
public class EventVectorChunk {
    @Id
    @GeneratedValue
    private UUID uuid;

    @Column(name = "source_event_uuid", nullable = false)
    private UUID sourceEventUuid;

    @Column(name = "chunk_text", nullable = false, columnDefinition = "TEXT")
    private String chunkText;

    // embedding vector(1536) / bytea
    @Column(name = "embedding", nullable = false, columnDefinition = "bytea")
    @Convert(converter = FloatArrayToByteArrayConverter.class)
    private float[] embedding;

    @Column(length = 100)
    private String category;

    @Column(length = 10)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
