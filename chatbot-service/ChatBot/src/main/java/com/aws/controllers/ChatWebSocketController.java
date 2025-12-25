package com.aws.controllers;

import com.aws.pojo.AnswerResponse;
import com.aws.services.RAGService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    @Autowired
    private RAGService ragService;

    public ChatWebSocketController(RAGService ragService) {
        this.ragService = ragService;
    }

    @MessageMapping("/query") // client gửi /app/query
    @SendTo("/topic/answer") // gửi về tất cả client subscribe /topic/answer
    public AnswerResponse queryWebSocket(ClientMessage message) throws Exception {
        String question = message.getQuestion();
        int topK = message.getTopK() != null ? message.getTopK() : 10;
        //return ragService.queryRAG(question, topK);

        // Lấy câu trả lời từ service
        AnswerResponse response = ragService.queryRAG(question, topK);

        // Log câu trả lời
        System.out.println("=== WebSocket Response ===");
        System.out.println("Question: " + question);
        System.out.println("Answer: " + response.getAnswer());
        System.out.println("Related Event IDs: " + response.getSourceEventUuids());

        return response;
    }

    public static class ClientMessage {
        private String question;
        private Integer topK;

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public Integer getTopK() { return topK; }
        public void setTopK(Integer topK) { this.topK = topK; }
    }
}
