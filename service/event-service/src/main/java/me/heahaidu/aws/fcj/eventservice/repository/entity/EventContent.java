package me.heahaidu.aws.fcj.eventservice.repository.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.awt.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "event_content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventContent {
    @Id
    @UuidGenerator( style = UuidGenerator.Style.TIME)
    private UUID uuid;

    @Column(name = "event_uuid", nullable = false)
    private UUID eventUuid;

    @Column(name = "previous_version_uuid")
    private UUID previousVersionUuid;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String category;

    @Column(name = "country_code", nullable = false)
    private String countryCode;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @Column(name = "image_urls", columnDefinition = "TEXT[]")
    private List<String> imageUrls;

    @Column(name = "cohost_uuids", columnDefinition = "UUID[]")
    private List<UUID> cohostUuids;

    @Column(name = "edited_by", nullable = false)
    private UUID editedBy;

    @Column(name = "is_current_version", nullable = false)
    private Boolean isCurrentVersion = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "currency", length = 3)
    private String currency;
}