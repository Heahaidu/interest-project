package me.heahaidu.aws.fcj.notificationservice.util.realtime;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;

@Component
public class NotificationRealtimeHub {

    private final ConcurrentHashMap<UUID, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter connect(UUID userUuid) {
        SseEmitter emitter = new SseEmitter(0L);

        emitters.computeIfAbsent(userUuid, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remove(userUuid, emitter));
        emitter.onTimeout(() -> remove(userUuid, emitter));
        emitter.onError(e -> remove(userUuid, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(Map.of("status", "connected"), MediaType.APPLICATION_JSON));
        } catch (IOException ignored) {}

        return emitter;
    }

    public void publish(UUID userUuid, String eventName, Object data) {
        var list = emitters.get(userUuid);
        if (list == null || list.isEmpty()) return;

        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                remove(userUuid, emitter);
            }
        }
    }

    private void remove(UUID userUuid, SseEmitter emitter) {
        var list = emitters.get(userUuid);
        if (list == null) return;
        list.remove(emitter);
        if (list.isEmpty()) emitters.remove(userUuid);
    }

    public void pingAll() {
//        for (var entry : emitters.entrySet()) {
//            UUID userUuid = entry.getKey();
//            for (SseEmitter emitter : entry.getValue()) {
//                try {
//                    emitter.send(SseEmitter.event()
//                            .name("ping")
//                            .data(Map.of("time",Instant.now().toString()), MediaType.APPLICATION_JSON));
//                } catch (Exception e) {
//                    remove(userUuid, emitter);
//                }
//            }
//        }
    }
}