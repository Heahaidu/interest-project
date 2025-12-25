package me.heahaidu.aws.fcj.eventservice.repository.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface EventProjection {

    UUID getEventUuid();
    UUID getCreatedBy();
    Integer getCurrentParticipants();
    Integer getMaxParticipants();
    String getTitle();
    Instant getStartTime();
    Instant getEndTime();
    String getLocation();
    String getCity();
    String getCategory();
    String[] getImageUrls();
    String getCountryCode();
    boolean getIsLike();
}
