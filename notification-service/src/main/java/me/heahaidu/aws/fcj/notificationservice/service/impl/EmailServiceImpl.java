package me.heahaidu.aws.fcj.notificationservice.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.heahaidu.aws.fcj.notificationservice.domain.event.NotificationEvent;
import me.heahaidu.aws.fcj.notificationservice.service.port.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    public void sendRegistrationConfirmation(NotificationEvent notificationEvent,  byte[] qrImage) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(notificationEvent.userEmail());
            helper.setSubject("🎉 Registration Confirmed - " + notificationEvent.body());

            Context context = new Context();
            context.setVariable("eventTitle", notificationEvent.body());
            context.setVariable("eventDate", formatDate(notificationEvent.startTime()));
            context.setVariable("eventTime", formatTime(notificationEvent.endTime()));
            context.setVariable("eventLocation", notificationEvent.location());
            context.setVariable("eventUrl", frontendBaseUrl + "/events/" + notificationEvent.eventId());
            context.setVariable("qrCodeCid", "qrcode");

            String htmlContent = templateEngine.process("registration-confirmation", context);
            helper.setText(htmlContent, true);

            // Attach QR code as inline image
            helper.addInline("qrcode", new ByteArrayResource(qrImage), "image/png");

            mailSender.send(message);
            log.info("Registration confirmation email sent to: {}", notificationEvent.userEmail());

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send registration email to: {}", notificationEvent.userEmail(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendCancellationNotification() {

    }

    @Override
    public void sendEventReminder() {

    }

    private String formatDate(Instant instant) {
        return DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy")
                .withZone(ZoneId.systemDefault())
                .format(instant);
    }

    private String formatTime(Instant instant) {
        return DateTimeFormatter.ofPattern("h:mm a")
                .withZone(ZoneId.systemDefault())
                .format(instant);
    }
}
