package me.heahaidu.aws.fcj.eventservice.repository.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface EventContentProjection extends EventProjection {
    UUID getEventUuid();
    UUID getUserUuid();
    Integer getCurrentParticipants();
    Integer getMaxParticipants();
    String getTitle();
    String getDescription();
    Instant getStartTime();
    Instant getEndTime();
    String getLocation();
    String getCity();
    String getCategory();
    String getCountryCode();
    String[] getImageUrls();
    BigDecimal getPrice();
    String getCurrency();
}
