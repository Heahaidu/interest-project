package com.aws.services;

import com.aws.pojo.AnswerResponse;
import com.aws.pojo.EventMessageDTO;

import java.util.List;
import java.util.UUID;

public interface RAGService {
    void createChunks(UUID eventUuid, List<String> chunks);
    AnswerResponse queryRAG(String question, int topK);
    void createChunksFromEvent(EventMessageDTO event);
}
