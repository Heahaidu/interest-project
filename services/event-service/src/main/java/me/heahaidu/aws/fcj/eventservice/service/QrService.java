package me.heahaidu.aws.fcj.eventservice.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import io.micrometer.core.instrument.binder.logging.LogbackMetrics;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class QrService {

    private final LogbackMetrics logbackMetrics;
//    @Value("${app.qr.secret:your-secret-key-here}")

    private String qrSecret = "1";
    private int qrWidth = 300, qrHeight = 300;

    public QrService(LogbackMetrics logbackMetrics) {
        this.logbackMetrics = logbackMetrics;
    }

    public String encodeUuid(UUID uuid) {
        ByteBuffer buffer = ByteBuffer.allocate(16);
        buffer.putLong(uuid.getMostSignificantBits());
        buffer.putLong(uuid.getLeastSignificantBits());
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buffer.array());
    }

    public UUID decodeUuid(String encoded) {
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(encoded);
            ByteBuffer buffer = ByteBuffer.wrap(bytes);
            long mostSig = buffer.getLong();
            long leastSig = buffer.getLong();
            return new UUID(mostSig, leastSig);
        } catch (IllegalArgumentException e) {
            log.error("Failed to decode UUID from: {}", encoded);
            throw new IllegalArgumentException("Invalid ticket code");
        }
    }

    public UUID parseQrContent(String qrContent) {
        try {
            String[] parts = qrContent.split(":");
            if (parts.length != 3 || !"REG".equals(parts[0])) {
                throw new IllegalArgumentException("Invalid QR format");
            }

            String encoded = parts[1];
            String checksum = parts[2];

            if (!checksum.equals(generateChecksum(encoded))) {
                throw new IllegalArgumentException("Invalid QR checksum");
            }

            return decodeUuid(encoded);
        } catch (Exception e) {
            log.error("Failed to parse QR content: {}", qrContent, e);
            throw new IllegalArgumentException("Invalid QR code");
        }
    }

    public String generateQrContent(UUID registrationUuid) {
        String encoded = encodeUuid(registrationUuid);
        String checksum = generateChecksum(encoded);
        return String.format("REG:%s:%s", encoded, checksum);
    }

    public byte[] generateQrCodeImage(UUID registrationUuid) {
        String content = generateQrContent(registrationUuid);
        return generateQrCodeImageFromContent(content);
    }

    private byte[] generateQrCodeImageFromContent(String content) {
        try {
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 2);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, qrWidth, qrHeight, hints);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

            return outputStream.toByteArray();
        } catch (WriterException | IOException e) {
            log.error("Failed to generate QR code for content: {}", content, e);
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    private String generateChecksum(String data) {
        String toHash = data + qrSecret;
        int hash = toHash.hashCode();
        return Integer.toHexString(hash).substring(0, 6).toUpperCase();
    }
}
