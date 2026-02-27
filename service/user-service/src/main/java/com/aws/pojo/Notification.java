package com.aws.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue
    private UUID uuid;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "notification_type")
    private String notificationType;

    @Column(length = 50)
    private String priority;

    @Column(length = 200)
    private String title;

    @Column(length = 2000)
    private String body;

    @Column(name = "deep_link")
    private String deepLink;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "delivery_status")
    private String deliveryStatus;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}
