package me.heahaidu.aws.fcj.eventservice.repository.entity;

import jakarta.persistence.*;
import lombok.*;
import me.heahaidu.aws.fcj.eventservice.enums.RegistrationStatus;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "event_registration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRegistration {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID uuid;

    @Column(name = "event_uuid")
    private UUID eventUuid;

    @Column(name = "user_uuid")
    private UUID userUuid;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_status")
    private RegistrationStatus registrationStatus;

    @Column(name = "registration_notes", columnDefinition = "TEXT")
    private String registrationNotes;

    @Column(name = "check_in_time")
    private Instant checkInTime;

    @Column(name = "check_out_time")
    private Instant checkOutTime;

    @Column(name = "ticket_price", precision = 10, scale = 2)
    private BigDecimal ticketPrice;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "payment_transaction_uuid")
    private UUID paymentTransactionUuid;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

}