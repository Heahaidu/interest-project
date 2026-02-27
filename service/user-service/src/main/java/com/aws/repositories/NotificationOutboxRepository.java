package com.aws.repositories;

import com.aws.pojo.NotificationOutbox;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface NotificationOutboxRepository extends JpaRepository<NotificationOutbox, UUID> {

    // Lấy tất cả outbox theo eventType với phân trang
    Page<NotificationOutbox> findByEventType(String eventType, Pageable pageable);

    // Lấy tất cả outbox chưa được xử lý (processedAt = null) với phân trang
    Page<NotificationOutbox> findByProcessedAtIsNull(Pageable pageable);

    // Lấy tất cả outbox đã xử lý (processedAt != null) với phân trang
    Page<NotificationOutbox> findByProcessedAtIsNotNull(Pageable pageable);

    // Lấy outbox đã xử lý trước 1 thời điểm nhất định (ví dụ để xóa cũ)
    Page<NotificationOutbox> findByProcessedAtBefore(LocalDateTime dateTime, Pageable pageable);
}