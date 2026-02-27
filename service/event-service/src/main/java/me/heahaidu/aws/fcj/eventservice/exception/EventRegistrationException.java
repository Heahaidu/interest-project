package me.heahaidu.aws.fcj.eventservice.exception;

public class EventRegistrationException extends EventException {

    public EventRegistrationException(String errorCode, String message) {
        super(errorCode, message);
    }

    public static EventRegistrationException alreadyRegistered() {
        return new EventRegistrationException("ALREADY_REGISTERED", "User is already registered for this event");
    }

    public static EventRegistrationException notRegistered() {
        return new EventRegistrationException("NOT_REGISTERED", "User is not registered for this event");
    }

    public static EventRegistrationException eventFull() {
        return new EventRegistrationException("EVENT_FULL", "Event has reached maximum participants");
    }

    public static EventRegistrationException eventNotPublished() {
        return new EventRegistrationException("EVENT_NOT_PUBLISHED", "Event is not available for registration");
    }

    public static EventRegistrationException eventEnded() {
        return new EventRegistrationException("EVENT_ENDED", "Event has already ended");
    }

}
