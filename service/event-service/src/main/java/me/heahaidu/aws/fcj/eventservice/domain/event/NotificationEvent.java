package me.heahaidu.aws.fcj.eventservice.domain.event;

import java.time.Instant;
import java.util.UUID;

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
        UUID registrationUuid,
        Instant occurredAt,
        int schemaVersion
) {}

/*
 *                 "Ticket Confirmed",
 *                 "You have successfully booked tickets for " + event.content().getTitle().toLowerCase(),
 */