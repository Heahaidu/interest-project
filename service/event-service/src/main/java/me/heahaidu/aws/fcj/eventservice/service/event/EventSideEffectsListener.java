package me.heahaidu.aws.fcj.eventservice.service.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.heahaidu.aws.fcj.eventservice.domain.event.AIEvent;
import me.heahaidu.aws.fcj.eventservice.messaging.AIEventProducer;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventContent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventSideEffectsListener {

    private final AIEventProducer  aiEventProducer;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publishAIChat(EventContent content){
        aiEventProducer.publish(new AIEvent(
                content.getEventUuid(),
                content.getTitle(),
                content.getDescription(),
                content.getStartTime(),
                content.getEndTime(),
                content.getCountryCode(),
                content.getCity(),
                content.getLocation(),
                content.getCategory()
        ));
    }
}
