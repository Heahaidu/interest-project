package com.aws.components;

import com.aws.pojo.EventMessageDTO;
import com.aws.services.RAGService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class EventCreatedConsumer {

    @Autowired
    private RAGService ragService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(
            topics = "event-created",
            groupId = "rag-chunk-service-v2",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(String message) {
        if (message == null || message.isBlank()) {
            log.warn("Empty Kafka message received, skip");
            return;
        }

        EventMessageDTO event;
        try {
            event = objectMapper.readValue(message, EventMessageDTO.class);
        } catch (Exception e) {
            log.error("Failed to parse Kafka message: {}", message, e);
            return; // Không throw, tránh retry vô hạn
        }

        log.info("EVENT DTO = {}", event);

        try {
            ragService.createChunksFromEvent(event);
        } catch (Exception e) {
            // Bắt lỗi khi gọi external API, log chi tiết, tránh crash listener
            log.error("Failed to create chunks for event: {}", event.getUuid(), e);
            // Có thể ghi vào dead-letter topic để xử lý sau
        }
    }
}

