package com.aws.pojo;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class AnswerResponse {
    private List<UUID> sourceEventUuids;
    private String answer;

    public AnswerResponse(List<UUID> sourceEventUuids, String answer) {
        this.sourceEventUuids = sourceEventUuids;
        this.answer = answer;
    }
}
