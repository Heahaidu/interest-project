package me.heahaidu.aws.fcj.eventservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.heahaidu.aws.fcj.eventservice.common.ErrorCode;
import me.heahaidu.aws.fcj.eventservice.controller.dto.request.CreateFeedbackRequest;
import me.heahaidu.aws.fcj.eventservice.controller.dto.response.FeedbackResponse;
import me.heahaidu.aws.fcj.eventservice.exception.EventException;
import me.heahaidu.aws.fcj.eventservice.exception.EventFeedbackException;
import me.heahaidu.aws.fcj.eventservice.exception.EventNotFoundException;
import me.heahaidu.aws.fcj.eventservice.repository.entity.Event;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventContent;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventFeedback;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventRegistration;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventContentRepository;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventFeedbackRepository;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventRegistrationRepository;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventRepository;
import me.heahaidu.aws.fcj.eventservice.service.EventFeedbackService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EventFeedbackServiceImpl implements EventFeedbackService {

    private final EventRepository eventRepository;
    private final EventContentRepository eventContentRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventFeedbackRepository eventFeedbackRepository;

    @Override
    public FeedbackResponse createFeedback(UUID eventUuid, CreateFeedbackRequest request, UUID userUuid) {

        log.info("Creating feedback: eventUuid={}, userUuid={}", eventUuid, userUuid);

        Event event = eventRepository.findByUuidAndNotDeleted(eventUuid)
                .orElseThrow(() -> new EventNotFoundException(eventUuid));

        EventContent content = eventContentRepository.findByUuid(event.getCurrentVersionUuid())
                .orElseThrow(() -> new EventException(ErrorCode.EVENT_CONTENT_NOT_FOUND));

        if (content.getEndTime().isAfter(Instant.now())) {
            throw EventFeedbackException.eventNotEnded();
        }

        EventRegistration registration = eventRegistrationRepository
                .findByEventAndUser(eventUuid, userUuid)
                .orElseThrow(EventFeedbackException::notFound);

        if (registration.getCheckInTime().isBefore(Instant.now())) {
            throw EventFeedbackException.notCheckedIn();
        }

        if (eventFeedbackRepository.existsByEventAndUser(eventUuid, userUuid)) {
            throw EventFeedbackException.alreadySubmitted();
        }


        EventFeedback feedback = EventFeedback.builder()
                .eventUuid(eventUuid)
                .userUuid(userUuid)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        feedback = eventFeedbackRepository.save(feedback);

        log.info("Feedback created: uuid={}", feedback.getUuid());
        return FeedbackResponse.from(feedback);
    }

    @Override
    public void deleteFeedback(UUID feedbackUuid, UUID userUuid) {

    }

    @Override
    public List<FeedbackResponse> getEventFeedbacks(UUID eventUuid) {
        return List.of();
    }
}
