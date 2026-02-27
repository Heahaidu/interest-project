package me.heahaidu.aws.fcj.notificationservice.util.mapper;

import me.heahaidu.aws.fcj.notificationservice.controller.dto.response.NotificationResponse;
import me.heahaidu.aws.fcj.notificationservice.repository.entity.NotificationEntity;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(NotificationEntity n, Instant readAllBefore, Set<UUID> readIds) {
        boolean isRead = !n.getCreatedAt().isAfter(readAllBefore) || readIds.contains(n.getUuid());

        return new NotificationResponse(
                n.getUuid(),
                n.getType(),
                n.getPriority(),
                n.getBody(),
                n.getDeepLink(),
                n.getImageUrl(),
                n.getCreatedAt(),
                isRead
        );
    }
}