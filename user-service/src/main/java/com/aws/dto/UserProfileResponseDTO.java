package com.aws.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserProfileResponseDTO {
    private UUID uuid;
    private String email;
    private String avatarUrl;
    private String bio;

    private String username;
    private String firstName;
    private String lastName;
    private String fullName;
    private LocalDate dateOfBirth;
    private String city;
    private String countryCode;

    private Object interests;
    private Object socialLinks;
    private Object preferences;
    private Object privacySettings;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
