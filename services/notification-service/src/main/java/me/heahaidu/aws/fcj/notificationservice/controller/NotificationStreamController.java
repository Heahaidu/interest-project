package me.heahaidu.aws.fcj.notificationservice.controller;

import me.heahaidu.aws.fcj.notificationservice.util.realtime.NotificationRealtimeHub;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationStreamController {

    private final NotificationRealtimeHub hub;

    public NotificationStreamController(NotificationRealtimeHub hub) {
        this.hub = hub;
    }

    private UUID user(@RequestHeader("X-User-UUID") String userId) {
        return UUID.fromString(userId);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestHeader("X-User-UUID") String userId) {
        return hub.connect(user(userId));
    }
}