package me.heahaidu.aws.fcj.notificationservice.service.impl;

import com.github.f4b6a3.uuid.UuidCreator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.heahaidu.aws.fcj.notificationservice.domain.event.NotificationEvent;
import me.heahaidu.aws.fcj.notificationservice.repository.entity.NotificationEntity;
import me.heahaidu.aws.fcj.notificationservice.repository.jpa.NotificationJpaRepository;
import me.heahaidu.aws.fcj.notificationservice.service.port.NotificationIngestService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationIngestServiceImpl implements NotificationIngestService {

    private final NotificationJpaRepository notificationRepo;
    private final ApplicationEventPublisher publisher;

    @Value("${app.frontend.base-url:localhost:3000}")
    private String frontendBaseUrl;

    @Override
    @Transactional
    public UUID ingest(NotificationEvent event) {
        UUID id = UuidCreator.getTimeOrderedEpoch();

        var n = new NotificationEntity();
        n.setUuid(id);
        n.setUserUuid(event.userUuid());
        n.setType(event.notificationType());
        n.setPriority((short) 1);
        n.setBody(event.body());
        n.setDeepLink("/discover/e?" + event.eventId());
        n.setImageUrl(event.imageUrl());
        n.setCreatedAt(Instant.now());

        notificationRepo.save(n);

        publisher.publishEvent(n);

        return id;
    }
}