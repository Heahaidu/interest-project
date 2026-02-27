package me.heahaidu.aws.fcj.eventservice.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import me.heahaidu.aws.fcj.eventservice.domain.event.NotificationEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String topic;

    public NotificationEventProducer(
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper,
            @Value("${app.kafka.topics.notification-events}") String topic
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.topic = topic;
    }

    public void publish(NotificationEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
        kafkaTemplate.send(topic, event.userUuid().toString(), json);
        } catch (Exception e) {
            throw new RuntimeException("Failed to publish notification event to Kafka", e);
        }
    }
}