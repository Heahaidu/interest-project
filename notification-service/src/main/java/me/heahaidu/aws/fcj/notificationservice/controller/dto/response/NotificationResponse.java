package me.heahaidu.aws.fcj.notificationservice.controller.dto.response;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID uuid,
        String type,
        short priority,
        String body,
        String deepLink,
        String imageUrl,
        Instant createdAt,
        boolean isRead
) {}