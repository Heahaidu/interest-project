package me.heahaidu.aws.fcj.notificationservice.domain.event;

import java.time.Instant;
import java.util.UUID;

public record NotificationStoredEvent(
        UUID notificationUuid,
        UUID userUuid,
        String type,
        short priority,
        String title,
        String body,
        String deepLink,
        String imageUrl,
        Instant createdAt
) {}