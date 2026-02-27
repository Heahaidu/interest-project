package me.heahaidu.aws.fcj.eventservice.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Event errors
    EVENT_NOT_FOUND("EVENT_001", "Event not found"),
    EVENT_CONTENT_NOT_FOUND("EVENT_002", "Event content not found"),
    INVALID_TIME_RANGE("EVENT_003", "End time must be after start time"),
    EVENT_NOT_PUBLISHED("EVENT_004", "Event is not available for registration"),
    EVENT_ALREADY_ENDED("EVENT_005", "Event has already ended"),
    EVENT_FULL("EVENT_006", "Event has reached maximum participants"),

    // Registration errors
    ALREADY_REGISTERED("REG_001", "User is already registered for this event"),
    NOT_REGISTERED("REG_002", "User is not registered for this event"),

    // Auth errors
    UNAUTHORIZED("AUTH_001", "User not authenticated"),
    FORBIDDEN("AUTH_002", "User does not have permission"),
    PAGE_NOT_FOUND("AUTH_003", "Page not found"),

    // Validation errors
    VALIDATION_ERROR("VAL_001", "Validation error"),

    // System errors
    INTERNAL_ERROR("SYS_001", "Internal server error"),

    // Feedback errors
    FEEDBACK_NOT_CHECKED_IN("FEEDBACK_001", "User must check-in to submit feedback"),
    FEEDBACK_ALREADY_SUBMITTED("FEEDBACK_002", "User has already submitted feedback for this event"),
    FEEDBACK_NOT_FOUND("FEEDBACK_003", "Feedback not found"),
    FEEDBACK_EVENT_NOT_ENDED("FEEDBACK_004", "Can only submit feedback after event has ended"),
    FEEDBACK_OWN_FEEDBACK("FEEDBACK_005", "Cannot mark own feedback as helpful"),
    FEEDBACK_ALREADY_MARKED_HELPFUL("FEEDBACK_006", "Already marked this feedback as helpful"),

    // Data error
    DATA_INTEGRITY_VIOLATION("DATA_INTEGRITY_VIOLATION","Invalid data. Please contact support if this persists"),

    // Interest error
    ALREADY_INTEREST("ALREADY_INTEREST", "You has already interested in this event"),
    NOT_INTEREST_YET("NOT_INTEREST_YET", "You are not interested in this event");

    private final String code;
    private final String message;
}