package me.heahaidu.aws.fcj.notificationservice.service.port;

import me.heahaidu.aws.fcj.notificationservice.domain.event.NotificationEvent;

public interface EmailService {
    void sendRegistrationConfirmation(NotificationEvent notificationEvent, byte[] qrImage);
    void sendCancellationNotification();
    void sendEventReminder();
}
