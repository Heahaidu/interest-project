package com.aws.repositories;

import com.aws.pojo.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    // Tìm tất cả thông báo của 1 user
    Page<Notification> findByUserUuid(UUID userUuid, Pageable pageable);

    // Tìm thông báo chưa đọc của 1 user
    Page<Notification> findByUserUuidAndIsReadFalse(UUID userUuid, Pageable pageable);

    // Tìm tất cả thông báo đã hết hạn
    Page<Notification> findByExpiresAtBefore(LocalDateTime now, Pageable pageable);

    // Có thể thêm các query khác theo nhu cầu, ví dụ lọc theo type hoặc priority
    //Page<Notification> findByUserUuidAndNotificationType(UUID userUuid, String notificationType);

}
