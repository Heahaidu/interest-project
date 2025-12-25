package me.heahaidu.aws.fcj.eventservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.heahaidu.aws.fcj.eventservice.controller.dto.request.CreateEventRequest;
import me.heahaidu.aws.fcj.eventservice.controller.dto.request.EditEventRequest;
import me.heahaidu.aws.fcj.eventservice.controller.dto.request.QrCheckInRequest;
import me.heahaidu.aws.fcj.eventservice.controller.dto.response.EventListResponse;
import me.heahaidu.aws.fcj.eventservice.controller.dto.response.EventResponse;
import me.heahaidu.aws.fcj.eventservice.service.EventInterestService;
import me.heahaidu.aws.fcj.eventservice.service.EventRegisterService;
import me.heahaidu.aws.fcj.eventservice.service.EventService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EventController {

    private final EventService eventService;
    private final EventInterestService eventInterestService;
    private final EventRegisterService eventRegisterService;

    @GetMapping("/events")
    public ResponseEntity<EventListResponse> getEvents(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "20") Integer limit,
            @RequestParam(required = false) String cursor
            )
    {

        EventListResponse eventListResponse = eventService.getEvents(from, to, search, limit, cursor);

        return ResponseEntity.ok(eventListResponse);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<EventResponse> getEvent(@PathVariable UUID eventId) {
        EventResponse eventResponse = eventService.getEvent(eventId);
        return ResponseEntity.ok(eventResponse);
    }
    @PostMapping(
            value = "/event/create",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )

    public ResponseEntity<EventResponse> createEvent(
            @RequestHeader("X-User-UUID") UUID userUuid,

            @RequestPart("event") @Valid CreateEventRequest request,

            @RequestPart(value = "image") MultipartFile image
    ) {
        log.info("Create event userUuid {}, request: {}", userUuid, request);

        EventResponse event = eventService.createEvent(request, image, userUuid);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(event);
    }


    @PostMapping("/event/edit/{eventUuid}")
    public ResponseEntity<EventResponse> editEvent(
            @PathVariable UUID eventUuid,
            @RequestHeader("X-User-UUID") UUID userUuid,
            @Valid @RequestBody EditEventRequest request
    ) {
        EventResponse event = eventService.editEvent(eventUuid, request, userUuid);
        return ResponseEntity.ok(event);
    }

    @GetMapping("/event/delete/{eventId}")
    public ResponseEntity<EventResponse> deleteEvent(@PathVariable UUID eventId, @RequestHeader("X-User-UUID") UUID userUuid) {
        eventService.deleteEvent(userUuid, eventId);
        return ResponseEntity.status(200).build();
    }

    @GetMapping("/event/hide/{eventId}")
    public ResponseEntity<EventResponse> hideEvent(@PathVariable UUID eventId, @RequestHeader("X-User-UUID") UUID userUuid) {
        eventService.hideEvent(userUuid, eventId);
        return ResponseEntity.status(200).build();
    }

    @GetMapping("/event/show/{eventId}")
    public ResponseEntity<EventResponse> showEvent(@PathVariable UUID eventId, @RequestHeader("X-User-UUID") UUID userUuid) {
        eventService.showEvent(userUuid, eventId);
        return ResponseEntity.status(200).build();
    }

    @GetMapping("/event/registration/{eventId}")
    public ResponseEntity<?> registerEvent(
            @PathVariable UUID eventId,
            @RequestHeader("X-User-UUID") UUID userUuid,
            @RequestHeader("X-User-Email") String email) {
        eventRegisterService.registerEvent(eventId, userUuid, email);
        return ResponseEntity.status(200).build();
    }

    @GetMapping("/event/unregistration/{eventId}")
    public ResponseEntity<?> unregisterEvent(
            @PathVariable UUID eventId,
            @RequestHeader("X-User-UUID") UUID userUuid,
            @RequestHeader("X-User-Email") String email) {
        eventRegisterService.unregisterEvent(eventId, userUuid, email);
        return ResponseEntity.status(200).build();
    }

    @GetMapping("/event/interest/{eventUuid}")
    public ResponseEntity<?> interestEvent(
            @PathVariable UUID eventUuid,
            @RequestHeader("X-User-UUID") UUID userUuid) {

        eventInterestService.interest(eventUuid, userUuid);
        return ResponseEntity.status(200).build();
    }

    @GetMapping("/event/uninterest/{eventUuid}")
    public ResponseEntity<?> uninterestEvent(
            @PathVariable UUID eventUuid,
            @RequestHeader("X-User-UUID") UUID userUuid) {
        eventInterestService.uninterest(eventUuid, userUuid);
        return ResponseEntity.status(200).build();
    }

    @GetMapping("/event/registration/{eventUuid}/qr-code")
    public ResponseEntity<byte[]> getQrCode(
            @PathVariable UUID eventUuid,
            @RequestHeader("X-User-UUID") UUID userUuid
    ) {
        byte[] qrImage = eventRegisterService.getTicketQrCode(eventUuid, userUuid);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"ticket-qr.png\"")
                .body(qrImage);
    }

    @PostMapping("/events/{eventUuid}/check-in")
    public ResponseEntity<?> checkIn(
            @PathVariable UUID eventUuid,
            @RequestBody QrCheckInRequest request,
            @RequestHeader("X-User-UUID") UUID staffUuid
    ) {
        if (request.getQrCode() != null) {
            eventRegisterService.checkInByQrCode(eventUuid, staffUuid, request.getQrCode());
        } else {
            throw new IllegalArgumentException("Either qrContent or registrationUuid is required");
        }

        return ResponseEntity.status(201).build();
    }

}
