package com.aws.controllers;

import com.aws.pojo.AnswerResponse;
import com.aws.services.RAGService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.kafka.annotation.KafkaListener;


import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chatbot")
public class ChatController {

    @Autowired
    private RAGService ragService;

    // Tạo chunks cho sự kiện
    @PostMapping("/create-chunks/{eventUuid}")
    public ResponseEntity<String> createChunks(
            @PathVariable UUID eventUuid,
            @RequestBody List<String> chunks) {
        ragService.createChunks(eventUuid, chunks);
        return ResponseEntity.ok("Chunks created successfully");
    }

    @PostMapping("/query")
    public ResponseEntity<AnswerResponse> query(@RequestParam String question,
                                        @RequestParam(defaultValue = "10") int topK) {
        AnswerResponse response = ragService.queryRAG(question, topK);
        return ResponseEntity.ok(response);
    }

}