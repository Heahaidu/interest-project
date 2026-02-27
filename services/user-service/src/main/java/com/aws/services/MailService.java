package com.aws.services;

public interface MailService {
    void sendMail(String toEmail, String subject, String content);
}
