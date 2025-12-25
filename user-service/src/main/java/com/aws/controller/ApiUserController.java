package com.aws.controller;


import com.aws.dto.AccountDTO;
import com.aws.dto.UserProfileDTO;
import com.aws.pojo.Account;
import com.aws.pojo.UserProfile;
import com.aws.services.AccountService;
import com.aws.services.UserProfileService;
import com.aws.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api")
public class ApiUserController {
    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private AccountService accountService;

    @PostMapping("/register/profile")
    public ResponseEntity<?> registerProfile(@RequestBody UserProfileDTO dto, Principal principal) {
        try{
            String email = principal.getName();
            Account account = this.accountService.getAccountByEmail(email);

            UserProfile userProfile = new UserProfile();
            userProfile.setBio(dto.getBio());
            userProfile.setCity(dto.getCity());
            userProfile.setFirstName(dto.getFirstName());
            userProfile.setLastName(dto.getLastName());
            userProfile.setDateOfBirth(
                    dto.getDateOfBirth() != null ? LocalDate.parse(dto.getDateOfBirth()) : null
            );
            userProfile.setSocialLinks(dto.getSocialLinks());
            this.userProfileService.addOrUpdateUserProfile(userProfile);
            return ResponseEntity.ok("Thêm thành công");

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


}
