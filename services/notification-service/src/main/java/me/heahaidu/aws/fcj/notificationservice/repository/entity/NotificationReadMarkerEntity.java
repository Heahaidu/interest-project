package me.heahaidu.aws.fcj.notificationservice.repository.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notification_read_marker")
public class NotificationReadMarkerEntity {

    @Id
    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "read_all_before", nullable = false, columnDefinition = "timestamp")
    private Instant readAllBefore;

    @Column(name = "updated_at", nullable = false, columnDefinition = "timestamp")
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        if (readAllBefore == null) readAllBefore = Instant.EPOCH;
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getUserUuid() { return userUuid; }
    public void setUserUuid(UUID userUuid) { this.userUuid = userUuid; }

    public Instant getReadAllBefore() { return readAllBefore; }
    public void setReadAllBefore(Instant readAllBefore) { this.readAllBefore = readAllBefore; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}