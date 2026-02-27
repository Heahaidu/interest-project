package me.heahaidu.aws.fcj.notificationservice.service.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.heahaidu.aws.fcj.notificationservice.domain.event.NotificationEvent;
import me.heahaidu.aws.fcj.notificationservice.service.port.EmailService;
import me.heahaidu.aws.fcj.notificationservice.service.port.QrService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class RegistrationEmailListener {

    private final EmailService emailService;
    private final QrService qrService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendEmail(NotificationEvent event) {
        try {
            byte[] qrImage = qrService.generateQrCodeImage(event.registrationUuid());

            emailService.sendRegistrationConfirmation(event, qrImage);
        } catch (Exception e) {
            log.error("Failed to send confirmation email for registration: {}", event.registrationUuid(), e);
        }
    }

}
