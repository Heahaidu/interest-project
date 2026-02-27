package me.heahaidu.aws.fcj.eventservice.exception;

import me.heahaidu.aws.fcj.eventservice.common.ErrorCode;

public class EventFeedbackException extends EventException {

    public EventFeedbackException(ErrorCode errorCode) {
        super(errorCode);
    }

    public EventFeedbackException(ErrorCode errorCode, String message) {
        super(errorCode.getCode(), message);
    }

    public static EventFeedbackException notCheckedIn() {
        return new EventFeedbackException(ErrorCode.FEEDBACK_NOT_CHECKED_IN);
    }

    public static EventFeedbackException alreadySubmitted() {
        return new EventFeedbackException(ErrorCode.FEEDBACK_ALREADY_SUBMITTED);
    }

    public static EventFeedbackException notFound() {
        return new EventFeedbackException(ErrorCode.FEEDBACK_NOT_FOUND);
    }

    public static EventFeedbackException eventNotEnded() {
        return new EventFeedbackException(ErrorCode.FEEDBACK_EVENT_NOT_ENDED);
    }

    public static EventFeedbackException ownFeedback() {
        return new EventFeedbackException(ErrorCode.FEEDBACK_OWN_FEEDBACK);
    }

//    public static EventFeedbackException alreadyMarkedHelpful() {
//        return new EventFeedbackException(ErrorCode.FEEDBACK_ALREADY_MARKED_HELPFUL);
//    }
}
