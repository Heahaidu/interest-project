package me.heahaidu.aws.fcj.notificationservice.service.impl;

import me.heahaidu.aws.fcj.notificationservice.repository.entity.NotificationReadMarkerEntity;
import me.heahaidu.aws.fcj.notificationservice.repository.jpa.NotificationReadMarkerJpaRepository;
import me.heahaidu.aws.fcj.notificationservice.repository.jpa.NotificationReadReceiptJpaRepository;
import me.heahaidu.aws.fcj.notificationservice.service.port.NotificationReadService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class NotificationReadServiceImpl implements NotificationReadService {

    private final NotificationReadReceiptJpaRepository receiptRepo;
    private final NotificationReadMarkerJpaRepository markerRepo;

    public NotificationReadServiceImpl(NotificationReadReceiptJpaRepository receiptRepo,
                                       NotificationReadMarkerJpaRepository markerRepo) {
        this.receiptRepo = receiptRepo;
        this.markerRepo = markerRepo;
    }

    @Override
    @Transactional
    public void markRead(UUID userUuid, UUID notificationUuid) {
        receiptRepo.insertIgnore(userUuid, notificationUuid);
    }

    @Override
    @Transactional
    public void readAll(UUID userUuid) {
        var marker = markerRepo.findById(userUuid).orElseGet(() -> {
            var m = new NotificationReadMarkerEntity();
            m.setUserUuid(userUuid);
            m.setReadAllBefore(Instant.EPOCH);
            m.setUpdatedAt(Instant.now());
            return m;
        });

        Instant now = Instant.now();
        if (marker.getReadAllBefore().isBefore(now)) {
            marker.setReadAllBefore(now);
        }
        markerRepo.save(marker);
    }
}