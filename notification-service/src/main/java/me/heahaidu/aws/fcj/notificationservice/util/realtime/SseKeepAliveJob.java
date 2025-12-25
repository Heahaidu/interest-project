package me.heahaidu.aws.fcj.notificationservice.util.realtime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SseKeepAliveJob {
    private final NotificationRealtimeHub hub;

    public SseKeepAliveJob(NotificationRealtimeHub hub) {
        this.hub = hub;
    }

    @Scheduled(fixedRate = 25000)
    public void ping() {
        hub.pingAll();
    }
}