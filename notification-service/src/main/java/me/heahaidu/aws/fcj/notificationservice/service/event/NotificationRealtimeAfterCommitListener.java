package me.heahaidu.aws.fcj.notificationservice.service.event;

import me.heahaidu.aws.fcj.notificationservice.domain.event.NotificationEvent;
import me.heahaidu.aws.fcj.notificationservice.repository.entity.NotificationEntity;
import me.heahaidu.aws.fcj.notificationservice.util.realtime.NotificationRealtimeHub;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

@Component
public class NotificationRealtimeAfterCommitListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationRealtimeAfterCommitListener.class);
    private final NotificationRealtimeHub hub;

    public NotificationRealtimeAfterCommitListener(NotificationRealtimeHub hub) {
        this.hub = hub;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onStored(NotificationEntity e) {
        hub.publish(e.getUserUuid(), "notification", e);
    }
}