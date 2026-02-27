package me.heahaidu.aws.fcj.eventservice.controller.dto.request;

import lombok.Data;

@Data
public class QrCheckInRequest {
    private String qrCode;
}
