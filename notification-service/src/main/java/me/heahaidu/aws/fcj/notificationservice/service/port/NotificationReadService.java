package me.heahaidu.aws.fcj.notificationservice.service.port;

import java.util.UUID;

public interface NotificationReadService {
    void markRead(UUID userUuid, UUID notificationUuid);
    void readAll(UUID userUuid);
}