package com.aws.exception;

import com.aws.common.ErrorCode;

public class LoginException extends RuntimeException {

    public LoginException(String message) {
        super(message);
    }

    public LoginException(ErrorCode errorCode) {
        super(errorCode.getMessage());
    }

}
