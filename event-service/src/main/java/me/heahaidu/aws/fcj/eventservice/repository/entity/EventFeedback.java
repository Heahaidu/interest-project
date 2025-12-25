package me.heahaidu.aws.fcj.eventservice.repository.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "event_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventFeedback {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID uuid;

    @Column(name = "event_uuid", nullable = false)
    private UUID eventUuid;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "rating", nullable = false)
    private Short rating;

    @Column(name = "comment", columnDefinition = "TEXT", nullable = false, length = 3000)
    private String comment;

    @Column(name = "sentiment", length = 10)
    private String sentiment;

    @Column(name = "sentiment_confidence", precision = 4, scale = 3)
    private BigDecimal sentimentConfidence;

    @Column(name = "tags", columnDefinition = "TEXT[]")
    private String tags;

    @Column(name = "helpful_count")
    private Integer helpfulCount;

    @Column(name = "created_at")
    private Instant createdAt;
}