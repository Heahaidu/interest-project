package me.heahaidu.aws.fcj.notificationservice.repository.jpa;

import me.heahaidu.aws.fcj.notificationservice.repository.entity.NotificationReadMarkerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationReadMarkerJpaRepository extends JpaRepository<NotificationReadMarkerEntity, UUID> {}