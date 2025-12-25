package com.aws.services;

public interface GenminiService {
    float[] getEmbedding(String text);
    String generateAnswer(String prompt);
}
