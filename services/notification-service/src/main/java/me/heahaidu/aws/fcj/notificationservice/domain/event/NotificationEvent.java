package me.heahaidu.aws.fcj.notificationservice.domain.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.Instant;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NotificationEvent(
        UUID eventId,
        UUID userUuid,
        String notificationType,
        String body,
        String imageUrl,
        String userEmail,
        Instant startTime,
        Instant endTime,
        String countryId,
        String city,
        String location,
        UUID registrationUuid
) {}