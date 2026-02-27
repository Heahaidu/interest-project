package me.heahaidu.aws.fcj.eventservice.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.heahaidu.aws.fcj.eventservice.controller.dto.request.CreateFeedbackRequest;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventFeedback;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponse {

    private UUID uuid;
    private UUID eventUuid;
    private UUID userUuid;
    private Short rating;
    private String comment;
    private Instant createdAt;

    public static FeedbackResponse from(EventFeedback feedback) {
        return FeedbackResponse.builder()
                .uuid(feedback.getUuid())
                .eventUuid(feedback.getEventUuid())
                .userUuid(feedback.getUserUuid())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedAt())
                .build();
    }

}
