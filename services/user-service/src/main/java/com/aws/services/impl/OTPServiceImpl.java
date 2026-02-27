package com.aws.services.impl;

import com.aws.services.OTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class OTPServiceImpl implements OTPService {
    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public void saveOtp(String key, String otp) {
        redisTemplate.opsForValue().set(key, otp, 5, TimeUnit.MINUTES);
    }

    @Override
    public void saveResetToken(String email, String token) {
        redisTemplate.opsForValue().set("reset:" + token, email, 10, TimeUnit.MINUTES);
    }

    @Override
    public String getEmailByResetToken(String token) {
        return redisTemplate.opsForValue().get("reset:" + token);
    }

    @Override
    public String getOtp(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    @Override
    public void deleteOtp(String key) {
        redisTemplate.delete(key);
    }
}
