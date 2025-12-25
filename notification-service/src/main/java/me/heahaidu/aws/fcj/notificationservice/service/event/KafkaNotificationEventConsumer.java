package me.heahaidu.aws.fcj.notificationservice.service.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import me.heahaidu.aws.fcj.notificationservice.domain.event.NotificationEvent;
import me.heahaidu.aws.fcj.notificationservice.service.port.NotificationIngestService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KafkaNotificationEventConsumer {

    private final ObjectMapper om;
    private final NotificationIngestService ingestService;

    @KafkaListener(topicPattern = "${app.kafka.topics.notification-events}", containerFactory = "kafkaListenerContainerFactory")
    public void onMessage(byte[] payload, Acknowledgment ack) throws Exception {
        NotificationEvent event = om.readValue(payload, NotificationEvent.class);
        ingestService.ingest(event);
        ack.acknowledge();
    }
}