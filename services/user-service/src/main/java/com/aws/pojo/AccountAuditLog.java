package com.aws.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "account_audit_log")
public class AccountAuditLog {

    @Id
    @GeneratedValue
    private UUID uuid;

    @Column(name = "account_uuid", nullable = false)
    private UUID accountUuid;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(nullable = false)
    private Boolean success = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
