package me.heahaidu.aws.fcj.notificationservice.repository.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notification")
@Getter
@Setter
public class NotificationEntity {

    @Id
    @Column(name = "uuid", nullable = false)
    private UUID uuid;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "type", nullable = false, length = 30)
    private String type;

    @Column(name = "priority", nullable = false)
    private short priority = 1;

    @Column(name = "body", nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "deep_link", columnDefinition = "text")
    private String deepLink;

    @Column(name = "image_url", columnDefinition = "text")
    private String imageUrl;

    @Column(name = "created_at", nullable = false, columnDefinition = "timestamp")
    private Instant createdAt;

    @Column(name = "expires_at", columnDefinition = "timestamp")
    private Instant expiresAt;

    @Column(name = "deleted_at", columnDefinition = "timestamp")
    private Instant deletedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

}