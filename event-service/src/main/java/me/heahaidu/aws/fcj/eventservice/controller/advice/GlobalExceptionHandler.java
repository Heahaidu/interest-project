package me.heahaidu.aws.fcj.eventservice.controller.advice;

import jakarta.servlet.http.HttpServletRequest;
import me.heahaidu.aws.fcj.eventservice.common.ApiError;
import me.heahaidu.aws.fcj.eventservice.common.ErrorCode;
import me.heahaidu.aws.fcj.eventservice.exception.EventException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EventException.class)
    public ResponseEntity<ApiError> handleEventException(EventException e, HttpServletRequest request) {
        String errorCode = e.getErrorCode();
        ApiError body = new ApiError(
                errorCode,
                e.getMessage(),
                Instant.now(),
                request.getRequestURI()
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrityViolationException(DataIntegrityViolationException e, HttpServletRequest request) {
        ApiError body = new ApiError(
                ErrorCode.DATA_INTEGRITY_VIOLATION.getCode(),
                ErrorCode.DATA_INTEGRITY_VIOLATION.getMessage(),
                Instant.now(),
                request.getRequestURI()
        );
        return ResponseEntity.badRequest().body(body);
    }

}
