package me.heahaidu.aws.fcj.eventservice.service.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.heahaidu.aws.fcj.eventservice.domain.event.NotificationEvent;
import me.heahaidu.aws.fcj.eventservice.domain.event.RegistrationEventCommited;
import me.heahaidu.aws.fcj.eventservice.messaging.NotificationEventProducer;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventContent;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventRegistration;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class RegistrationSideEffectsListener {
    private final NotificationEventProducer notificationEventProducer;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publishNotification(RegistrationEventCommited event) {
        notificationEventProducer.publish(new NotificationEvent(
                event.content().getEventUuid(),
                event.registration().getUserUuid(),
                "EVENT_REGISTERED",
                event.content().getTitle(),
                event.content().getImageUrls() == null ? "" : event.content().getImageUrls().getFirst(),
                event.email(),
                event.content().getStartTime(),
                event.content().getEndTime(),
                event.content().getCountryCode(),
                event.content().getCity(),
                event.content().getLocation(),
                event.registration().getUuid(),
                Instant.now(),
                1
        ));
    }

}
