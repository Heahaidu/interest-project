package me.heahaidu.aws.fcj.notificationservice.repository.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class NotificationReadReceiptId implements Serializable {

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "notification_id", nullable = false)
    private UUID notificationId;

    public NotificationReadReceiptId() {}

    public NotificationReadReceiptId(UUID userUuid, UUID notificationId) {
        this.userUuid = userUuid;
        this.notificationId = notificationId;
    }

    public UUID getUserUuid() { return userUuid; }
    public UUID getNotificationId() { return notificationId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof NotificationReadReceiptId that)) return false;
        return Objects.equals(userUuid, that.userUuid) && Objects.equals(notificationId, that.notificationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userUuid, notificationId);
    }
}