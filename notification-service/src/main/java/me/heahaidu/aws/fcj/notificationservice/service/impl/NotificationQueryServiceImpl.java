package me.heahaidu.aws.fcj.notificationservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.heahaidu.aws.fcj.notificationservice.controller.dto.response.NotificationPageResponse;
import me.heahaidu.aws.fcj.notificationservice.repository.entity.NotificationReadMarkerEntity;
import me.heahaidu.aws.fcj.notificationservice.repository.jpa.NotificationJpaRepository;
import me.heahaidu.aws.fcj.notificationservice.repository.jpa.NotificationReadMarkerJpaRepository;
import me.heahaidu.aws.fcj.notificationservice.repository.jpa.NotificationReadReceiptJpaRepository;
import me.heahaidu.aws.fcj.notificationservice.service.port.NotificationQueryService;
import me.heahaidu.aws.fcj.notificationservice.util.mapper.NotificationMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationQueryServiceImpl implements NotificationQueryService {

    private final NotificationJpaRepository notificationRepo;
    private final NotificationReadMarkerJpaRepository markerRepo;
    private final NotificationReadReceiptJpaRepository receiptRepo;
    private final NotificationMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public NotificationPageResponse list(UUID userUuid, Instant cursorCreatedAt, UUID cursorUuid, int limit) {
        Instant now = Instant.now();
        Instant readAllBefore = markerRepo.findById(userUuid)
                .map(NotificationReadMarkerEntity::getReadAllBefore)
                .orElse(Instant.EPOCH);

        var page = PageRequest.of(0, limit);
        var notifications = (cursorCreatedAt == null || cursorUuid == null)
                ? notificationRepo.firstPage(userUuid, now, page)
                : notificationRepo.nextPage(userUuid, now, cursorCreatedAt, cursorUuid, page);

        if (notifications.isEmpty()) return NotificationPageResponse.empty();

        var needCheck = notifications.stream()
                .filter(n -> n.getCreatedAt().isAfter(readAllBefore))
                .map(n -> n.getUuid())
                .toList();

        Set<UUID> readIds = needCheck.isEmpty()
                ? Set.of()
                : receiptRepo.findByUserAndIds(userUuid, needCheck).stream()
                .map(rr -> rr.getId().getNotificationId())
                .collect(Collectors.toSet());

        var items = notifications.stream()
                .map(n -> mapper.toResponse(n, readAllBefore, readIds))
                .toList();

        var last = notifications.get(notifications.size() - 1);
        return new NotificationPageResponse(items, last.getCreatedAt(), last.getUuid());
    }
}