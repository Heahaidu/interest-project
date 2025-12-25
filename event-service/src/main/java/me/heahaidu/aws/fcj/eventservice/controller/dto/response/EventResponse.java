package me.heahaidu.aws.fcj.eventservice.controller.dto.response;

import lombok.*;
import me.heahaidu.aws.fcj.eventservice.repository.entity.Event;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventContent;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class EventResponse {
    private UUID uuid;
    private String title;
    private String description;
    private Instant startTime;
    private Instant endTime;
    private String location;
    private String city;
    private String countryCode;
    private String category;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private String imageUrl;
    private BigDecimal price;
    private UUID createdBy;
    private String currency;
    private boolean isLike;

    public static EventResponse from(Event event, EventContent content) {
        return EventResponse.builder()
                .uuid(event.getUuid())
                .createdBy(event.getCreatedBy())
                .maxParticipants(event.getMaxParticipants())
                .currentParticipants(event.getCurrentParticipants())
                .title(content.getTitle())
                .description(content.getDescription())
                .location(content.getLocation())
                .city(content.getCity())
                .countryCode(content.getCountryCode())
                .category(content.getCategory())
                .startTime(content.getStartTime())
                .endTime(content.getEndTime())
//                .imageUrl(content.getImageUrls().getFirst())
                .build();
    }

}