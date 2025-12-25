package com.aws.services.impls;

import com.aws.pojo.AnswerResponse;
import com.aws.pojo.EventMessageDTO;
import com.aws.pojo.EventVectorChunk;
import com.aws.services.GenminiService;
import com.aws.services.RAGService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import com.aws.repositories.EventVectorChunkRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RAGServiceImpl implements RAGService {

    @Autowired
    private EventVectorChunkRepository chunkRepository;
    @Autowired
    private GenminiService genminiService;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void createChunks(UUID eventUuid, List<String> chunks) {
        for (String chunk : chunks) {
            float[] embedding = genminiService.getEmbedding(chunk);
            EventVectorChunk entity = new EventVectorChunk();
            entity.setSourceEventUuid(eventUuid);
            entity.setChunkText(chunk);
            entity.setEmbedding(embedding);
            entity.setStatus("ACTIVE");
            chunkRepository.save(entity);
        }
    }

    @Override
    public void createChunksFromEvent(EventMessageDTO event) {

        // Gom text thành 1 block
        String fullText = String.join("\n",
                event.getTitle(),
                event.getDescription(),
                "Location: " + event.getLocation(),
                "City: " + event.getCity(),
                "Category: " + event.getCategory()
        );
        log.info("FULL TEXT = {}", fullText);

        // Chunk text
        List<String> chunks = splitText(fullText, 300);

        // Reuse logic cũ
        createChunks(event.getUuid(), chunks);
    }

    private List<String> splitText(String text, int maxLength) {
        List<String> chunks = new ArrayList<>();
        int start = 0;

        while (start < text.length()) {
            int end = Math.min(start + maxLength, text.length());
            chunks.add(text.substring(start, end));
            start = end;
        }
        return chunks;
    }

    //    @Override
//    public String queryRAG(String question, int topK) {
//        float[] queryEmbedding = genminiService.getEmbedding(question);
//
//        List<EventVectorChunk> topChunks = findTopKSimilar(queryEmbedding, topK);
//
//        StringBuilder prompt = new StringBuilder();
//        for (EventVectorChunk c : topChunks) {
//            prompt.append(c.getChunkText()).append("\n---\n");
//        }
//        prompt.append("\nQuestion: ").append(question);
//
//        System.out.println("=== PROMPT SENT TO GEMINI ===");
//        System.out.println(prompt);
//
//        return genminiService.generateAnswer(prompt.toString());
//    }
    @Override
    public AnswerResponse queryRAG(String question, int topK) {
        //  Lấy embedding của câu hỏi
        float[] queryEmbedding = genminiService.getEmbedding(question);

        //Lấy top K chunk tương tự
        List<EventVectorChunk> topChunks = findTopKSimilar(queryEmbedding, topK);

        //Gom nội dung chunk thành prompt gửi cho model
        StringBuilder prompt = new StringBuilder();
        for (EventVectorChunk c : topChunks) {
            prompt.append(c.getChunkText()).append("\n---\n");
        }
        prompt.append("\nQuestion: ").append(question);

        System.out.println("=== PROMPT SENT TO GEMINI ===");
        System.out.println(prompt);

        // Lấy danh sách UUID của các event liên quan
        List<UUID> sourceEventUuids = topChunks.stream()
                .map(EventVectorChunk::getSourceEventUuid)
                .distinct()
                .toList();

        // Gọi model để tạo câu trả lời
        String answer = genminiService.generateAnswer(prompt.toString());

        // Trả về AnswerResponse
        return new AnswerResponse(sourceEventUuids, answer);
    }


    // Hàm findTopKSimilar với JdbcTemplate
    public List<EventVectorChunk> findTopKSimilar(float[] queryEmbedding, int topK) {

        List<EventVectorChunk> all = chunkRepository.findAll();

        return all.stream()
                .sorted((a, b) -> {
                    double simA = cosineSimilarity(queryEmbedding, a.getEmbedding());
                    double simB = cosineSimilarity(queryEmbedding, b.getEmbedding());
                    return Double.compare(simB, simA); // sort desc
                })
                .limit(topK)
                .collect(Collectors.toList());
    }

    private double cosineSimilarity(float[] v1, float[] v2) {
        double dot = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (int i = 0; i < v1.length; i++) {
            dot += v1[i] * v2[i];
            norm1 += v1[i] * v1[i];
            norm2 += v2[i] * v2[i];
        }

        return dot / (Math.sqrt(norm1) + 1e-10) / (Math.sqrt(norm2) + 1e-10);
    }


}