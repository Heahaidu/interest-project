package com.aws.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "page")
public class Page {

    @Id
    @GeneratedValue
    private UUID uuid;

    @Column(name = "owner_uuid", nullable = false)
    private UUID ownerUuid;

    @Column(length = 150, nullable = false)
    private String name;

    @Column(length = 150, nullable = false, unique = true)
    private String slug;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "page_type", length = 20)
    private PageType pageType = PageType.PERSONAL;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "is_public")
    private Boolean isPublic = true;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "follower_count")
    private Integer followerCount = 0;

    @Column(name = "event_count")
    private Integer eventCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private PageStatus status = PageStatus.ACTIVE;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PageType {
        PERSONAL, ORGANIZATION, BUSINESS, COMMUNITY
    }

    public enum PageStatus {
        ACTIVE, SUSPENDED, DELETED
    }
}
