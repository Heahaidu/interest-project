package com.aws.repositories;

import com.aws.pojo.NotificationDevice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationDeviceRepository extends JpaRepository<NotificationDevice, UUID> {

    // Lấy tất cả device của 1 user với phân trang
    Page<NotificationDevice> findByUserUuid(UUID userUuid, Pageable pageable);

    // Lấy device còn active của 1 user với phân trang
    Page<NotificationDevice> findByUserUuidAndIsActiveTrue(UUID userUuid, Pageable pageable);

    // Lấy device theo loại (deviceType) và user với phân trang
    Page<NotificationDevice> findByUserUuidAndDeviceType(UUID userUuid, String deviceType, Pageable pageable);

    // Lấy device theo token (thường dùng khi gửi push notification)
    NotificationDevice findByDeviceToken(String deviceToken);
}
