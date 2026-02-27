package me.heahaidu.aws.fcj.eventservice.service;

import me.heahaidu.aws.fcj.eventservice.controller.dto.request.CreateEventRequest;
import me.heahaidu.aws.fcj.eventservice.controller.dto.request.EditEventRequest;
import me.heahaidu.aws.fcj.eventservice.controller.dto.response.EventListResponse;
import me.heahaidu.aws.fcj.eventservice.controller.dto.response.EventResponse;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.UUID;

public interface EventService {
    EventListResponse getEvents(Instant from, Instant to, String search, Integer limit, String cursor);
    EventResponse getEvent(UUID eventUuid);
    EventResponse createEvent(CreateEventRequest request, MultipartFile image, UUID userUuid);
    void deleteEvent(UUID userUuid, UUID eventUuid);
    EventResponse editEvent(UUID eventUuid, EditEventRequest request, UUID createdBy);
    void hideEvent(UUID userUuid, UUID eventUuid);
    void showEvent(UUID userUuid, UUID eventUuid);
}