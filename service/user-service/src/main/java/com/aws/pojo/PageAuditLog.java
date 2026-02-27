package com.aws.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "page_audit_log")
public class PageAuditLog {

    @Id
    @GeneratedValue
    private UUID uuid;

    @Column(name = "page_uuid", nullable = false)
    private UUID pageUuid;

    @Column(name = "user_uuid")
    private UUID userUuid;

    @Column(length = 100)
    private String action;

    @Column(columnDefinition = "jsonb")
    private String details;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
