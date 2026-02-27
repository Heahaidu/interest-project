package me.heahaidu.aws.fcj.eventservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.heahaidu.aws.fcj.eventservice.common.ErrorCode;
import me.heahaidu.aws.fcj.eventservice.controller.dto.request.CreateEventRequest;
import me.heahaidu.aws.fcj.eventservice.controller.dto.request.EditEventRequest;
import me.heahaidu.aws.fcj.eventservice.controller.dto.response.EventListResponse;
import me.heahaidu.aws.fcj.eventservice.controller.dto.response.EventResponse;
import me.heahaidu.aws.fcj.eventservice.enums.EventStatus;
import me.heahaidu.aws.fcj.eventservice.enums.EventVisibility;
import me.heahaidu.aws.fcj.eventservice.exception.EventException;
import me.heahaidu.aws.fcj.eventservice.exception.EventNotFoundException;
import me.heahaidu.aws.fcj.eventservice.repository.dto.EventContentProjection;
import me.heahaidu.aws.fcj.eventservice.repository.dto.EventProjection;
import me.heahaidu.aws.fcj.eventservice.repository.entity.Event;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventContent;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventContentRepository;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventListRepository;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventRepository;
import me.heahaidu.aws.fcj.eventservice.service.EventService;
import me.heahaidu.aws.fcj.eventservice.service.ImageStorageService;
import me.heahaidu.aws.fcj.eventservice.util.CursorUtil;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventServiceImpl implements EventService {

    private final EventListRepository eventListRepository;
    private final EventRepository eventRepository;
    private final EventContentRepository eventContentRepository;
    private final ImageStorageService imageStorageService;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public EventListResponse getEvents(Instant from, Instant to, String search, Integer limit, String cursor) {
        if (limit == null || limit <= 0 || limit > 100) {
            limit = 20;
        }
        if (from == null || to == null) {
            from = Instant.now().minus(Duration.ofDays(3));
            to = Instant.now().plus(Duration.ofDays(3));
        }

        Instant cursorStart = null;
        UUID cursorUuid = null;

        if (cursor != null && !cursor.isBlank()) {
            var decoded = CursorUtil.decode(cursor);
            cursorStart = decoded.startTime();
            cursorUuid = decoded.uuid();
        }

        System.out.println("====== REQUEST PARAMS ======");
        System.out.println("from (before): " + from);
        System.out.println("to (before): " + to);
        System.out.println("search: " + search);
        System.out.println("limit: " + limit);
        System.out.println("cursor: " + cursor);
        System.out.println("============================");

        List<EventProjection> rows = eventListRepository.findEventsKeyset(
                from, to, search, cursorStart, cursorUuid, limit
        ).orElseThrow(() -> new EventException(ErrorCode.EVENT_NOT_FOUND));

        List<EventResponse> items = rows.stream().map(r -> EventResponse.builder()
                .uuid(r.getEventUuid())
                .createdBy(r.getCreatedBy())
                .title(r.getTitle())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .location(r.getLocation())
                .city(r.getCity())
                .category(r.getCategory())
                .maxParticipants(r.getMaxParticipants())
                .currentParticipants(r.getCurrentParticipants())
                .imageUrl(r.getImageUrls() != null ? r.getImageUrls()[0] : "")
                .countryCode(r.getCountryCode())
                .build()
        ).toList();

        boolean hasNext = items.size() == limit;
        String nextCursor = null;

        if (hasNext) {
            var last = rows.getLast();
            nextCursor = CursorUtil.encode(last.getStartTime(), last.getEventUuid());
        }

        return EventListResponse.builder()
                .items(items)
                .nextCursor(nextCursor)
                .hasNext(hasNext)
                .build();
    }

    @Override
    public EventResponse getEvent(UUID eventUuid) {
        EventContentProjection item = eventContentRepository.findByEventByUuid(eventUuid);
        return EventResponse.builder()
                .uuid(item.getEventUuid())
                .createdBy(item.getCreatedBy())
                .title(item.getTitle())
                .description(item.getDescription())
                .startTime(item.getStartTime())
                .endTime(item.getEndTime())
                .location(item.getLocation())
                .city(item.getCity())
                .imageUrl(item.getImageUrls() != null ? item.getImageUrls()[0] : "")
                .category(item.getCategory())
                .maxParticipants(item.getMaxParticipants())
                .currentParticipants(item.getCurrentParticipants())
                .price(item.getPrice())
                .currency(item.getCurrency())
                .countryCode(item.getCountryCode())
                .build();
    }

    @Transactional
    @Override
    public EventResponse createEvent(CreateEventRequest request, MultipartFile image, UUID userUuid) {
        log.info("Creating event by user: {}", userUuid);

        if (image == null || image.isEmpty()) {
            throw new EventException("IMAGE_NOT_FOUND", "Image is required");
        }

        verifyCreatePermission(userUuid);
        validateTimeRange(request.getStartTime(), request.getEndTime());

        Event event = Event.builder()
                .status(EventStatus.PUBLISHED)
                .visibility(EventVisibility.PUBLIC)
                .maxParticipants(request.getMaxParticipants())
                .createdBy(userUuid)
                .publishedAt(Instant.now())
                .acceptedAt(Instant.now())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        event.setCurrentVersionUuid(UUID.randomUUID());
        event = eventRepository.save(event);

        EventContent content = EventContent.builder()
                .eventUuid(event.getUuid())
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .city(request.getCity())
                .category(request.getCategory())
                .countryCode(request.getCountryCode())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .imageUrls(request.getImageUrls())
                .editedBy(userUuid)
                .isCurrentVersion(true)
                .createdAt(Instant.now())
                .price(request.getPrice())
                .currency(request.getCurrency())
                .build();

        content = eventContentRepository.save(content);

        event.setCurrentVersionUuid(content.getUuid());
        event = eventRepository.save(event);


        String imageUrl = imageStorageService.upload(image);
        content.setImageUrls(List.of(imageUrl));
        applicationEventPublisher.publishEvent(content);

        log.info("Event created successfully: uuid={}", event.getUuid());
        return EventResponse.from(event, content);
    }

    @Override
    public void deleteEvent(UUID userUuid, UUID eventUuid) {
        log.info("Delete event: eventUuid={}, userUuid={}", eventUuid, userUuid);
        Event event = eventRepository.findByUuidAndNotDeleted(eventUuid)
                .orElseThrow(() -> new EventNotFoundException(eventUuid));

        if (!event.getCreatedBy().equals(userUuid)) {
            log.info("Event creator {} request user {}", event.getCreatedBy(), userUuid);
            throw new EventException("WRONG", "Some thing went wrong");
        }

        event.setDeletedAt(Instant.now());
        eventRepository.save(event);
    }

    @Override
    @Transactional
    public EventResponse editEvent(UUID eventUuid, EditEventRequest request, UUID userUuid) {
        log.info("Editing event: eventUuid={}, userUuid={}", eventUuid, userUuid);

        Event event = eventRepository.findByUuidAndNotDeleted(eventUuid)
                .orElseThrow(() -> new EventNotFoundException(eventUuid));

        validateTimeRange(request.getStartTime(), request.getEndTime());

        if (!event.getCreatedBy().equals(userUuid)) {
            log.info("Event creator {} request user {}", event.getCreatedBy(), userUuid);
            throw new EventException("WRONG", "Some thing went wrong");
        }

        EventContent currentContent = eventContentRepository.findByUuid(event.getCurrentVersionUuid())
                .orElseThrow(() -> new EventException(ErrorCode.EVENT_CONTENT_NOT_FOUND));

//        Integer nextVersion = eventContentRepository.findMaxVersionByEventUuid(eventUuid) + 1;

        eventContentRepository.markAllVersionsAsNotCurrent(eventUuid);

        EventContent newContent = EventContent.builder()
                .eventUuid(eventUuid)
                .previousVersionUuid(currentContent.getUuid())
                .title(getOrDefault(request.getTitle(), currentContent.getTitle()))
                .description(getOrDefault(request.getDescription(), currentContent.getDescription()))
                .location(getOrDefault(request.getLocation(), currentContent.getLocation()))
                .city(getOrDefault(request.getCity(), currentContent.getCity()))
                .category(getOrDefault(request.getCategory(), currentContent.getCategory()))
                .countryCode(getOrDefault(request.getCountryCode(), currentContent.getCountryCode()))
                .startTime(request.getStartTime() != null ? request.getStartTime() : currentContent.getStartTime())
                .endTime(request.getEndTime() != null ? request.getEndTime() : currentContent.getEndTime())
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : currentContent.getImageUrls())
                .cohostUuids(request.getCoHostUuids() != null ? request.getCoHostUuids() : currentContent.getCohostUuids())
                .editedBy(userUuid)
                .isCurrentVersion(true)
                .build();

        newContent = eventContentRepository.save(newContent);

        currentContent.setIsCurrentVersion(false);
        eventContentRepository.save(currentContent);

        event.setCurrentVersionUuid(newContent.getUuid());
        if (request.getMaxParticipants() != null) {
            event.setMaxParticipants(request.getMaxParticipants());
        }
        if (request.getVisibility() != null) {
            event.setVisibility(EventVisibility.valueOf(request.getVisibility()));
        }
        event = eventRepository.save(event);

        log.info("Event edited successfully: uuid={}, version={}", eventUuid, -1);
        return EventResponse.from(event, newContent);
    }

    @Override
    public void hideEvent(UUID userUuid, UUID eventUuid) {
        log.info("Hide event: eventUuid={}, userUuid={}", eventUuid, userUuid);
        Event event = eventRepository.findByUuidAndNotDeleted(eventUuid)
                .orElseThrow(() -> new EventNotFoundException(eventUuid));

        if (!event.getCreatedBy().equals(userUuid)) {
            log.info("Event creator {} request user {}", event.getCreatedBy(), userUuid);
            throw new EventException("WRONG", "Some thing went wrong");
        }

        event.setVisibility(EventVisibility.PRIVATE);
        eventRepository.save(event);
    }

    @Override
    public void showEvent(UUID userUuid, UUID eventUuid) {
        log.info("Show event: eventUuid={}, userUuid={}", eventUuid, userUuid);
        Event event = eventRepository.findByUuidAndNotDeleted(eventUuid)
                .orElseThrow(() -> new EventNotFoundException(eventUuid));

        if (!event.getCreatedBy().equals(userUuid)) {
            log.info("Event creator {} request user {}", event.getCreatedBy(), userUuid);
            throw new EventException("WRONG", "Some thing went wrong");
        }

        event.setVisibility(EventVisibility.PUBLIC);
        eventRepository.save(event);
    }

    private void validateTimeRange(Instant startTime, Instant endTime) {
        if (endTime.isBefore(startTime)) {
            throw new EventException("INVALID_TIME", "End time must be after start times");
        }
        if (startTime.isBefore(Instant.now())) {
            throw new EventException("INVALID_TIME", "Start time must be after now");
        }
        if (endTime.isBefore(Instant.now())) {
            throw new EventException("INVALID_TIME", "End time must be after now");
        }
    }

    private void verifyCreatePermission(UUID userUuid) {

    }

    private void verifyEditPermission(UUID pageUuid, UUID userUuid) {

    }

    private String getOrDefault(String newValue, String defaultValue) {
        return (newValue != null && !newValue.isBlank()) ? newValue : defaultValue;
    }
}
