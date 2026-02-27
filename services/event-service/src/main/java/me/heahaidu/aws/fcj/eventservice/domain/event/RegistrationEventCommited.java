package me.heahaidu.aws.fcj.eventservice.domain.event;

import me.heahaidu.aws.fcj.eventservice.repository.entity.EventContent;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventRegistration;

public record RegistrationEventCommited(EventRegistration registration, String email, EventContent content) {

}