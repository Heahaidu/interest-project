package me.heahaidu.aws.fcj.eventservice.service;

import me.heahaidu.aws.fcj.eventservice.controller.dto.request.CreateFeedbackRequest;
import me.heahaidu.aws.fcj.eventservice.controller.dto.response.FeedbackResponse;

import java.util.List;
import java.util.UUID;

public interface EventFeedbackService {

    FeedbackResponse createFeedback(UUID eventUuid, CreateFeedbackRequest request, UUID userUuid);

    void deleteFeedback(UUID feedbackUuid, UUID userUuid);

    List<FeedbackResponse> getEventFeedbacks(UUID eventUuid);

}
