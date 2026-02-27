package me.heahaidu.aws.fcj.eventservice.domain.event;

import java.time.Instant;
import java.util.UUID;

public record AIEvent(
        UUID uuid,
        String title,
        String description,
        Instant startTime,
        Instant endTime,
        String countryCode,
        String city,
        String location,
        String category
) {
}
