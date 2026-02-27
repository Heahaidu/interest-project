package com.aws.services;

public interface OTPService {
    void saveOtp(String key, String otp);
    void saveResetToken(String email, String token);
    String getEmailByResetToken(String token);
    String getOtp(String key);
    void deleteOtp(String key);
}
