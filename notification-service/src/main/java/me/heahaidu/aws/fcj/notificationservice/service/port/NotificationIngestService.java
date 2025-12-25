package me.heahaidu.aws.fcj.notificationservice.service.port;

import me.heahaidu.aws.fcj.notificationservice.domain.event.NotificationEvent;

import java.util.UUID;

public interface NotificationIngestService {
    UUID ingest(NotificationEvent event);
}