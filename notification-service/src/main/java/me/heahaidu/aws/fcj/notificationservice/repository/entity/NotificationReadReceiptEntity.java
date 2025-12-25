package me.heahaidu.aws.fcj.notificationservice.repository.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "notification_read_receipt")
@Getter
@Setter
@RequiredArgsConstructor
public class NotificationReadReceiptEntity {

    @EmbeddedId
    private NotificationReadReceiptId id;

    @Column(name = "read_at", nullable = false, columnDefinition = "timestamp")
    private Instant readAt;

    @PrePersist
    void prePersist() {
        if (readAt == null) readAt = Instant.now();
    }

}