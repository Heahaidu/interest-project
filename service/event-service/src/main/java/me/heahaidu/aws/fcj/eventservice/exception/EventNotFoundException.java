package me.heahaidu.aws.fcj.eventservice.exception;

import java.util.UUID;

public class EventNotFoundException extends EventException {
    public EventNotFoundException(UUID uuid) {
        super("EVENT_NOT_FOUND", "Event not found with id: " + uuid.toString());
    }
}
