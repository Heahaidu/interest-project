package com.aws.pojo;

import lombok.Data;

import java.util.UUID;

@Data
public class EventMessageDTO {
    private UUID uuid;
    private String title;
    private String description;
    private String startTime;
    private String location;
    private String city;
    private String category;
}
