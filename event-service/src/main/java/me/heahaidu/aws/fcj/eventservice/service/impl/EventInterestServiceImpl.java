package me.heahaidu.aws.fcj.eventservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.heahaidu.aws.fcj.eventservice.controller.dto.response.EventListResponse;
import me.heahaidu.aws.fcj.eventservice.controller.dto.response.EventResponse;
import me.heahaidu.aws.fcj.eventservice.exception.EventInterestException;
import me.heahaidu.aws.fcj.eventservice.exception.EventNotFoundException;
import me.heahaidu.aws.fcj.eventservice.repository.dto.EventProjection;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventInterest;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventContentRepository;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventInterestRepository;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventRepository;
import me.heahaidu.aws.fcj.eventservice.service.EventInterestService;
import me.heahaidu.aws.fcj.eventservice.util.CursorUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class EventInterestServiceImpl implements EventInterestService {

    private final EventRepository eventRepository;
    private final EventContentRepository eventContentRepository;
    private final EventInterestRepository eventInterestRepository;

    @Override
    public EventListResponse getUserInterestEvents(UUID userUuid) {
        List<EventProjection> list = eventInterestRepository.findAllEventUserInterest(userUuid);

        List<EventResponse> items = list.stream().map(r -> EventResponse.builder()
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
                .imageUrl(r.getImageUrls()[0])
                .countryCode(r.getCountryCode())
                .isLike(true)
                .build()
        ).toList();

        boolean hasNext = items.size() == 20;
        String nextCursor = null;

        if (hasNext) {
            var last = list.getLast();
            nextCursor = CursorUtil.encode(last.getStartTime(), last.getEventUuid());
        }

        return EventListResponse.builder().items(items).hasNext(hasNext).nextCursor(nextCursor).build();
    }

    @Override
    @Transactional
    public void interest(UUID eventUuid, UUID userUuid) {

        if (!eventRepository.existsById(eventUuid)) {
            throw new EventNotFoundException(eventUuid);
        }

        if (eventInterestRepository.existsByEventUuidAndUserUuid(eventUuid, userUuid)) {
            throw EventInterestException.alreadyInterest();
        }

        EventInterest eventInterest = EventInterest.builder().eventUuid(eventUuid).userUuid(userUuid).build();
        eventInterestRepository.save(eventInterest);
    }

    @Override
    public void uninterest(UUID eventUuid, UUID userUuid) {
        if (!eventRepository.existsById(eventUuid)) {
            throw new EventNotFoundException(eventUuid);
        }

        eventInterestRepository.deleteByEventUuidAndUserUuid(eventUuid, userUuid);
    }
}
