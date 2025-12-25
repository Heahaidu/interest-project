package me.heahaidu.aws.fcj.eventservice.service;

import me.heahaidu.aws.fcj.eventservice.controller.dto.response.RegistrationResponse;

import java.util.UUID;

public interface EventRegisterService {
    RegistrationResponse registerEvent(UUID eventUuid, UUID createdBy, String userEmail);
    RegistrationResponse unregisterEvent(UUID eventUuid, UUID userUuid, String email);
    byte[] getTicketQrCode(UUID eventUuid, UUID userUuid);
    void checkInByQrCode(UUID eventUuid, UUID staffUuid, String qrCode);
}
