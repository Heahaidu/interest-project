package me.heahaidu.aws.fcj.notificationservice.controller.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record NotificationPageResponse(
        List<NotificationResponse> items,
        Instant nextCursorCreatedAt,
        UUID nextCursorUuid
) {
    public static NotificationPageResponse empty() {
        return new NotificationPageResponse(List.of(), null, null);
    }
}