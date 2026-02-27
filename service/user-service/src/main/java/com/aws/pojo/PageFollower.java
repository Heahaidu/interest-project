package com.aws.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "page_follower")
public class PageFollower {

    @Id
    @GeneratedValue
    private UUID uuid;

    @Column(name = "page_uuid", nullable = false)
    private UUID pageUuid;

    @Column(name = "follower_uuid", nullable = false)
    private UUID followerUuid;

    @Column(name = "notification_enabled")
    private Boolean notificationEnabled = true;

    @Column(name = "muted_until")
    private LocalDateTime mutedUntil;

    @Column(name = "followed_at")
    private LocalDateTime followedAt = LocalDateTime.now();
}
