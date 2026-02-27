package me.heahaidu.aws.fcj.notificationservice.controller;

import me.heahaidu.aws.fcj.notificationservice.controller.dto.response.NotificationPageResponse;
import me.heahaidu.aws.fcj.notificationservice.service.port.NotificationQueryService;
import me.heahaidu.aws.fcj.notificationservice.service.port.NotificationReadService;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationQueryService queryService;
    private final NotificationReadService readService;

    public NotificationController(NotificationQueryService queryService, NotificationReadService readService) {
        this.queryService = queryService;
        this.readService = readService;
    }

    private UUID user(@RequestHeader("X-User-UUID") String userId) {
        return UUID.fromString(userId);
    }

    @GetMapping
    public NotificationPageResponse list(
            @RequestHeader("X-User-UUID") String userId,
            @RequestParam(required = false) Instant cursorCreatedAt,
            @RequestParam(required = false) UUID cursorUuid,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return queryService.list(user(userId), cursorCreatedAt, cursorUuid, limit);
    }

    @GetMapping("/{uuid}/read")
    public void readOne(@RequestHeader("X-User-UUID") String userId, @PathVariable UUID uuid) {
        readService.markRead(user(userId), uuid);
    }

    @GetMapping("/read-all")
    public void readAll(@RequestHeader("X-User-UUID") String userId) {
        readService.readAll(user(userId));
    }
}