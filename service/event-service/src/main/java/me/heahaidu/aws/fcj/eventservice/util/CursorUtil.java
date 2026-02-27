package me.heahaidu.aws.fcj.eventservice.util;

import java.nio.ByteBuffer;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

public final class CursorUtil {
    private CursorUtil() {}

    public static String encode(Instant startTime, UUID uuid) {
        long millis = startTime.toEpochMilli();
        ByteBuffer buf = ByteBuffer.allocate(Long.BYTES + 16);
        buf.putLong(millis);
        buf.putLong(uuid.getMostSignificantBits());
        buf.putLong(uuid.getLeastSignificantBits());
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf.array());
    }

    public static DecodedCursor decode(String cursor) {
        byte[] bytes = Base64.getUrlDecoder().decode(cursor);
        ByteBuffer buf = ByteBuffer.wrap(bytes);
        long millis = buf.getLong();
        long msb = buf.getLong();
        long lsb = buf.getLong();
        return new DecodedCursor(Instant.ofEpochMilli(millis), new UUID(msb, lsb));
    }

    public record DecodedCursor(Instant startTime, UUID uuid) {}
}