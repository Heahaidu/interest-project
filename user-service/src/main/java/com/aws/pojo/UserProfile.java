package com.aws.pojo;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "user_profile")
public class UserProfile {

    @Id
    @Column(name = "account_uuid")
    private UUID accountUuid;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "full_name", insertable = false, updatable = false, length = 201)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "country_code", length = 3)
    private String countryCode;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Type(JsonType.class)
    @Column(name = "interests", columnDefinition = "jsonb")
    private JsonNode interests;

    @Type(JsonType.class)
    @Column(name = "social_links", columnDefinition = "jsonb")
    private JsonNode socialLinks;

    @Type(JsonType.class)
    @Column(name = "preferences", columnDefinition = "jsonb")
    private JsonNode preferences;

    @Type(JsonType.class)
    @Column(name = "privacy_settings", columnDefinition = "jsonb")
    private JsonNode privacySettings;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
