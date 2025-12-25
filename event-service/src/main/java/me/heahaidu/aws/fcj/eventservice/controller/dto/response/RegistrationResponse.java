package me.heahaidu.aws.fcj.eventservice.controller.dto.response;

import lombok.*;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventRegistration;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationResponse {

    private UUID registrationUuid;
    private UUID eventUuid;
    private UUID userUuid;
    private Instant registeredAt;
    private String message;
    private String email;

    public static RegistrationResponse from(EventRegistration registration, String email, String message) {
        return RegistrationResponse.builder()
                .registrationUuid(registration.getUuid())
                .eventUuid(registration.getEventUuid())
                .userUuid(registration.getUserUuid())
                .registeredAt(registration.getCreatedAt())
                .message(message)
                .email(email)
                .build();
    }

    public static RegistrationResponse unregistered(UUID eventUuid, UUID userUuid, String email) {
        return RegistrationResponse.builder()
                .eventUuid(eventUuid)
                .userUuid(userUuid)
                .message("Successfully unregistered from event")
                .build();
    }

}