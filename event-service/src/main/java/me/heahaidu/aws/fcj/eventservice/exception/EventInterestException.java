package me.heahaidu.aws.fcj.eventservice.exception;

import me.heahaidu.aws.fcj.eventservice.common.ErrorCode;

public class EventInterestException extends EventException{

    public EventInterestException(ErrorCode errorCode) {
        super(errorCode);
    }

    public static  EventInterestException alreadyInterest() {
        return new EventInterestException(ErrorCode.ALREADY_INTEREST);
    }

    public static  EventInterestException notInterested() {
        return new EventInterestException(ErrorCode.NOT_INTEREST_YET);
    }
}
