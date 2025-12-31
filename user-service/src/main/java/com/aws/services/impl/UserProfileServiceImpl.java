package com.aws.services.impl;

import com.aws.pojo.UserProfile;
import com.aws.repositories.UserProfileRepository;
import com.aws.services.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {


    private final UserProfileRepository userProfileRepository;

    @Override
    public UserProfile addOrUpdateUserProfile(UserProfile userProfile) {
        return this.userProfileRepository.save(userProfile);
    }

    @Override
    public void deleteUserProfile(UserProfile userProfile) {
        this.userProfileRepository.delete(userProfile);
    }

    @Override
    public UserProfile findUserProfileById(UUID uuid) {
        Optional<UserProfile> userProfile = this.userProfileRepository.findById(uuid);
        return userProfile.orElse(null);
    }

    @Override
    public UserProfile findByUsername(String username) {
        Optional<UserProfile> userProfile = this.userProfileRepository.findByUsername(username);
        return userProfile.orElse(null);
    }
}
