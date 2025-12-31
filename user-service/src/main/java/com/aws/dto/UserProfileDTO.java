package com.aws.dto;


import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class UserProfileDTO {
    private String firstName;
    private String lastName;
    private String fullName;
    private String dateOfBirth;
    private String city;
    private String bio;
    private JsonNode socialLinks;
    private Object privacySettings;
}
