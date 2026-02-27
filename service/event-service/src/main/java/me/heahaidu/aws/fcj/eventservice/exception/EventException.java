package me.heahaidu.aws.fcj.eventservice.exception;

import lombok.Getter;
import me.heahaidu.aws.fcj.eventservice.common.ErrorCode;

@Getter
public class EventException extends RuntimeException {

    private final String errorCode;

    public EventException(String errorCode, String errorMessage) {
        super(errorMessage);
        this.errorCode = errorCode;
    }

    public EventException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode.getCode();
    }
}
