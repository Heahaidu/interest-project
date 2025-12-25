package me.heahaidu.aws.fcj.eventservice.repository.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "event_interest",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_event_interest_event_user",
                columnNames = {"event_uuid", "user_uuid"}
        ))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventInterest {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID uuid;

    @Column(name = "event_uuid", nullable = false)
    private UUID eventUuid;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}