package com.aws.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    LOGIN_FAILED("LOGIN_FAILED", "Username, email or password is incorrect"),

    CREATE_TOKEN_FAILED("CREATE_TOKEN_FAILED", "Could not create token");

    private final String code;
    private final String message;

}
