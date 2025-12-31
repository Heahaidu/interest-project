package com.aws.services;

import com.aws.pojo.UserProfile;

import java.util.UUID;

public interface UserProfileService {
    UserProfile addOrUpdateUserProfile(UserProfile userProfile);
    void deleteUserProfile(UserProfile userProfile);
    UserProfile findUserProfileById(UUID uuid);
    UserProfile findByUsername(String username);
}
