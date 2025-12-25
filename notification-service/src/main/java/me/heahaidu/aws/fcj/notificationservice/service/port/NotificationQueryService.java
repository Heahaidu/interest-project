package me.heahaidu.aws.fcj.notificationservice.service.port;

import me.heahaidu.aws.fcj.notificationservice.controller.dto.response.NotificationPageResponse;

import java.time.Instant;
import java.util.UUID;

public interface NotificationQueryService {
    NotificationPageResponse list(UUID userUuid, Instant cursorCreatedAt, UUID cursorUuid, int limit);
}