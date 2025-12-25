package com.aws.repositories;

import com.aws.pojo.PageAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PageAuditLogRepository extends JpaRepository<PageAuditLog, UUID> {

    // Lấy tất cả log theo pageUuid với phân trang
    Page<PageAuditLog> findByPageUuid(UUID pageUuid, Pageable pageable);

    // Lấy tất cả log theo userUuid với phân trang
    Page<PageAuditLog> findByUserUuid(UUID userUuid, Pageable pageable);

    // Lấy tất cả log theo action với phân trang
    Page<PageAuditLog> findByAction(String action, Pageable pageable);

    // Lấy log theo pageUuid và action với phân trang
    Page<PageAuditLog> findByPageUuidAndAction(UUID pageUuid, String action, Pageable pageable);
}
