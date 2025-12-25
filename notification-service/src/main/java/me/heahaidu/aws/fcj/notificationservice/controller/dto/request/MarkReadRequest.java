package me.heahaidu.aws.fcj.notificationservice.controller.dto.request;

import java.util.UUID;

public record MarkReadRequest(UUID notificationUuid) {}