package me.heahaidu.aws.fcj.eventservice.repository.entity;

import jakarta.persistence.*;
import lombok.*;
import me.heahaidu.aws.fcj.eventservice.enums.EventStatus;
import me.heahaidu.aws.fcj.eventservice.enums.EventVisibility;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "event")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID uuid;

    @Column(name = "current_version_uuid", nullable = false)
    private UUID currentVersionUuid;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EventStatus status = EventStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    private EventVisibility visibility = EventVisibility.PUBLIC;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "current_participants", nullable = false)
    private Integer currentParticipants = 0;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "published_by")
    private UUID publishedBy;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "accepted_by")
    private UUID acceptedBy;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;
}