package com.aws.services.impls;

import com.aws.pojo.AnswerResponse;
import com.aws.pojo.EventVectorChunk;
import com.aws.services.GenminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class GenminiServiceImpl implements GenminiService {

    private WebClient webClient;
    private final String apiKey;

    public GenminiServiceImpl(@Value("${google.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1")
                .build();
    }

    @Override
    public float[] getEmbedding(String text) {
        Mono<float[]> mono = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/models/text-embedding-004:embedContent") // Corrected model/path
                        .queryParam("key", apiKey)
                        .build())
                .bodyValue(Map.of("content", Map.of("parts", new Object[]{Map.of("text", text)}))) // Corrected body structure for V1 API
                .retrieve()
                .bodyToMono(String.class)
                //.doOnNext(raw -> System.out.println("🔍 RAW JSON = " + raw))
                .map(raw -> {
                    try {
                        return new ObjectMapper().readValue(raw, EmbeddingResponse.class);
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to parse JSON: " + raw, e);
                    }
                })
                .map(r -> r.getEmbedding().getValues());
        return mono.block();
    }

    @Override
    public String generateAnswer(String prompt) {
        Mono<String> mono = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/models/gemini-2.5-flash:generateContent")
                        .queryParam("key", apiKey)
                        .build())
                .bodyValue(Map.of(
                        "contents", Map.of(
                                "parts", new Object[]{ Map.of("text", prompt) }
                        )
                ))
                .retrieve()
                .bodyToMono(GenerateResponse.class)
                .map(r -> r.getCandidates()[0]
                        .getContent()
                        .getParts()[0]
                        .getText());
        return mono.block();
    }

    public static class EmbeddingResponse {
        private Embedding embedding;

        public Embedding getEmbedding() {
            return embedding;
        }
        public void setEmbedding(Embedding embedding) {
            this.embedding = embedding;
        }

        // Lớp nội bộ để khớp với JSON Object "embedding"
        public static class Embedding {
            // Trường này sẽ chứa mảng float thực tế
            private float[] values;

            public float[] getValues() {
                return values;
            }
            public void setValues(float[] values) {
                this.values = values;
            }
        }
    }

    // DTO generate - kept your original names, but the structure is very different for V1
    public static  class GenerateResponse {
        private Candidate[] candidates;

        public Candidate[] getCandidates() { return candidates; }
        public void setCandidates(Candidate[] candidates) { this.candidates = candidates; }

        public static class Candidate {
            private Content content;

            public Content getContent() { return content; }
            public void setContent(Content content) { this.content = content; }
        }

        public static class Content {
            private Part[] parts;

            public Part[] getParts() { return parts; }
            public void setParts(Part[] parts) { this.parts = parts; }
        }

        public static class Part {
            private String text;

            public String getText() { return text; }
            public void setText(String text) { this.text = text; }
        }
    }

}