package com.aws.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "page_owner_snapshot")
public class PageOwnerSnapshot {

    @Id
    @GeneratedValue
    private UUID uuid;

    @Column(name = "page_uuid", nullable = false)
    private UUID pageUuid;

    @Column(name = "owner_uuid", nullable = false)
    private UUID ownerUuid;

    @Column(name = "owner_email")
    private String ownerEmail;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "snapshot_at")
    private LocalDateTime snapshotAt = LocalDateTime.now();
}
