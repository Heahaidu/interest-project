package me.heahaidu.aws.fcj.eventservice.controller.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEventRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
    private String title;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private Instant startTime;

    @NotNull(message = "End time is required")
    private Instant endTime;

    @NotBlank(message = "Country code is required")
    @Size(min = 2, max = 3)
    private String countryCode;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "Location is required")
    @Size(max = 255)
    private String location;

    @NotBlank(message = "Description is required")
    @Size(min = 100, message = "Description must be at least 100 characters")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(max = 100)
    private String category;

    @NotNull(message = "Max participants is required")
    @Min(value = 1, message = "Max participants must be at least 1")
    private Integer maxParticipants;

    @Size(min = 3, max = 3)
    private String currency = "USD";

    @NotBlank
    private String organizerType;

    private BigDecimal price;

    private boolean showParticipants = true;

    private boolean showReviews = true;

    private String timezone = "UTC";

    private List<String> imageUrls;

    private List<UUID> coHostUuids;

    private Integer currentParticipants;

    @NotNull
    private UUID host;

    private String visibility = "PUBLIC";
}