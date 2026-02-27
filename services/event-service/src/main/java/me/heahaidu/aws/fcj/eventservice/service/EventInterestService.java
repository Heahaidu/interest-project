package me.heahaidu.aws.fcj.eventservice.service;

import me.heahaidu.aws.fcj.eventservice.controller.dto.response.EventListResponse;
import me.heahaidu.aws.fcj.eventservice.repository.dto.EventProjection;

import java.util.List;
import java.util.UUID;

public interface EventInterestService {
    EventListResponse getUserInterestEvents(UUID userUuid);

    void interest(UUID eventUuid, UUID userUuid);
    void uninterest(UUID eventUuid, UUID userUuid);
}
