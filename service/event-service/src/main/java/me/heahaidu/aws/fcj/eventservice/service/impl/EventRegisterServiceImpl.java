package me.heahaidu.aws.fcj.eventservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.heahaidu.aws.fcj.eventservice.common.ErrorCode;
import me.heahaidu.aws.fcj.eventservice.controller.dto.response.RegistrationResponse;
import me.heahaidu.aws.fcj.eventservice.domain.event.RegistrationEventCommited;
import me.heahaidu.aws.fcj.eventservice.enums.EventStatus;
import me.heahaidu.aws.fcj.eventservice.enums.RegistrationStatus;
import me.heahaidu.aws.fcj.eventservice.exception.EventException;
import me.heahaidu.aws.fcj.eventservice.exception.EventRegistrationException;
import me.heahaidu.aws.fcj.eventservice.repository.entity.Event;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventContent;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventRegistration;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventContentRepository;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventRegistrationRepository;
import me.heahaidu.aws.fcj.eventservice.repository.jpa.EventRepository;
import me.heahaidu.aws.fcj.eventservice.service.EventRegisterService;
import me.heahaidu.aws.fcj.eventservice.service.QrService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@RequiredArgsConstructor
@Service
@Slf4j
@Transactional(readOnly = true)
public class EventRegisterServiceImpl implements EventRegisterService {

    private final EventRepository eventRepository;
    private final EventContentRepository eventContentRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    private final QrService qrService;

    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    @Transactional
    public RegistrationResponse registerEvent(UUID eventUuid, UUID userUuid, String email) {

        log.info("Registering for event: eventUuid={}, userUuid={}, email={}", eventUuid.toString(), userUuid.toString(), email);

        Event event = eventRepository.findByUuidAndStatusAndNotDeleted(eventUuid, EventStatus.PUBLISHED)
                .orElseThrow(EventRegistrationException::eventNotPublished);

        EventContent content = eventContentRepository.findByUuid(event.getCurrentVersionUuid())
                .orElseThrow(() -> new EventException(ErrorCode.EVENT_NOT_FOUND));

        if (content.getEndTime().isBefore(Instant.now())) {
            throw EventRegistrationException.eventEnded();
        }

        if (event.getCurrentParticipants() != null && event.getCurrentParticipants() >= event.getMaxParticipants()) {
            throw EventRegistrationException.eventFull();
        }

        EventRegistration registration = eventRegistrationRepository.findByEventAndUser(eventUuid, userUuid)
                .map(r -> {
                    if (r.getRegistrationStatus() == RegistrationStatus.REGISTERED)
                        throw EventRegistrationException.alreadyRegistered();
                    r.setRegistrationStatus(RegistrationStatus.REGISTERED);
                    return r;
                })
                .orElseGet(() -> EventRegistration.builder()
                        .eventUuid(eventUuid)
                        .userUuid(userUuid)
                        .createdAt(Instant.now())
                        .registrationStatus(RegistrationStatus.REGISTERED)
                        .currency(content.getCurrency())
                        .ticketPrice(content.getPrice())
                        .updatedAt(Instant.now())
                        .build());

        registration = eventRegistrationRepository.save(registration);

        int cur = event.getCurrentParticipants() == null ? 0 : event.getCurrentParticipants();
        event.setCurrentParticipants(cur + 1);

        eventRepository.save(event);

        log.info("Registration successful: registrationUuid={}", registration.getUuid());

        // Kafka send message
        applicationEventPublisher.publishEvent(new RegistrationEventCommited(registration, email, content));

        return RegistrationResponse.from(registration, email, "Successfully registered for event");
    }

    @Override
    @Transactional
    public RegistrationResponse unregisterEvent(UUID eventUuid, UUID userUuid, String email) {

        log.info("Unregistering from event: eventUuid={}, userUuid={}", eventUuid, userUuid);

        EventRegistration registration = eventRegistrationRepository
                .findByEventAndUserAndStatus(eventUuid, userUuid, RegistrationStatus.REGISTERED.name())
                .orElseThrow(EventRegistrationException::notRegistered);

        registration.setRegistrationStatus(RegistrationStatus.CANCELLED);
        eventRegistrationRepository.save(registration);

        Event event = eventRepository
                .findByUuidAndNotDeleted(eventUuid)
                .orElseThrow(EventRegistrationException::eventNotPublished);

        event.setCurrentParticipants(event.getCurrentParticipants() - 1);

        eventRepository.save(event);

        log.info("Unregistration successful: eventUuid={}, userUuid={}", eventUuid, userUuid);
        return RegistrationResponse.unregistered(eventUuid, userUuid, email);
    }

    @Override
    public byte[] getTicketQrCode(UUID eventUuid, UUID userUuid) {
        EventRegistration registration = eventRegistrationRepository.findByEventAndUserAndStatus(eventUuid, userUuid, RegistrationStatus.REGISTERED.name())
                .orElseThrow(EventRegistrationException::notRegistered);

        // Generate QR on-the-fly
        return qrService.generateQrCodeImage(registration.getUuid());
    }

    @Override
    @Transactional
    public void checkInByQrCode(UUID eventUuid, UUID staffUuid, String qrCode) {
        UUID registrationUuid = qrService.parseQrContent(qrCode);

        EventRegistration registration = eventRegistrationRepository.findByUuid(registrationUuid)
                .orElseThrow(() -> new EventException("INVALID_TICKET", "Invalid ticket"));

        if (registration.getRegistrationStatus() != RegistrationStatus.REGISTERED) {
            throw new EventException("INVALID_REGISTRATION_STATUS",
                    "Registration status: " + registration.getRegistrationStatus());
        }

        if (registration.getCheckInTime() != null) {
            throw new EventException("ALREADY_CHECKED_IN",
                    "Already checked in at: " + registration.getCheckInTime());
        }

        eventRegistrationRepository.checkInWithStaff(registrationUuid, staffUuid);

        log.info("Check-in successful: registration={}, staff={}", registrationUuid, staffUuid);
    }



}
