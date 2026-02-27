package com.aws.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "page_member")
public class PageMember {

    @Id
    @GeneratedValue
    private UUID uuid;

    @Column(name = "page_uuid", nullable = false)
    private UUID pageUuid;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private Role role = Role.MEMBER;

    @Column(columnDefinition = "jsonb")
    private String permissions;

    @Enumerated(EnumType.STRING)
    @Column(name = "invitation_status", length = 15)
    private InvitationStatus invitationStatus =InvitationStatus.PENDING;

    @Column(name = "invited_by")
    private UUID invitedBy;

    @Column(name = "invited_at")
    private LocalDateTime invitedAt;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(name = "left_at")
    private LocalDateTime leftAt;

    public enum Role {
        ADMIN, MODERATOR, EDITOR, MEMBER
    }

    public enum InvitationStatus {
        PENDING, ACCEPTED, DECLINED, REMOVED
    }
}
