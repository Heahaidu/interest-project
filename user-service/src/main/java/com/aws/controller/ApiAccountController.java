package com.aws.controller;


import com.aws.dto.AccountDTO;
import com.aws.dto.UserProfileDTO;
import com.aws.dto.UserProfileResponseDTO;
import com.aws.pojo.Account;
import com.aws.pojo.UserProfile;
import com.aws.services.*;
import com.aws.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user/auth")
@RequiredArgsConstructor
public class ApiAccountController {

    private final AccountService accountService;
    private final MailService mailService;
    private final OTPService otpService;
    private final PasswordEncoder passwordEncoder;
    private final UserProfileService userProfileService;
    private final ImageStorageService imageStorageService;
    private final DisAccountService disAccountService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AccountDTO dto) {

        if (dto.getEmail() == null || dto.getPassword() == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Username or password cannot be null");
        }

        String loginInput = dto.getEmail().trim();
        Account account;

        if (loginInput.contains("@")) {
            account = accountService.getAccountByEmail(loginInput);
        } else {
            UserProfile userProfile = this.userProfileService.findByUsername(loginInput);
            account = accountService.getAccountByUUID(userProfile.getAccountUuid());
        }

        if (account == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username/email or password");
        }



        boolean authOK = accountService.authenticate(account.getEmail(), dto.getPassword());
        if (!authOK) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username/email or password");
        }

        if (!account.getEmailVerified()) {
            String otp = String.valueOf(new Random().nextInt(900000) + 100000);
            otpService.saveOtp(account.getEmail(), otp);

            mailService.sendMail(
                    account.getEmail(),
                    "Mã OTP xác thực",
                    "Mã OTP của bạn là: " + otp + "\nMã này sẽ hết hạn sau 5 phút."
            );

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Email not verified. OTP has been sent.");
        }

        String token;
        try {
            token = JwtUtils.generateToken(account.getEmail(), account.getUuid());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not create JWT");
        }

        account.setLastLoginAt(LocalDateTime.now());
        accountService.addOrUpdateAccount(account);

        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }


    @RequestMapping("/secure/profile")
    @ResponseBody
    @CrossOrigin
    public ResponseEntity<?> getProfile(Principal principal) {
        Account account = accountService.getAccountByEmail(principal.getName());
        UserProfile userProfile = userProfileService.findUserProfileById(account.getUuid());

        UserProfileResponseDTO response = new UserProfileResponseDTO();

        response.setUuid(account.getUuid());
        response.setEmail(account.getEmail());
        response.setAvatarUrl(userProfile.getAvatarUrl());
        response.setBio(userProfile.getBio());
        response.setUsername(userProfile.getUsername());
        response.setFirstName(userProfile.getFirstName());
        response.setLastName(userProfile.getLastName());
        response.setFullName(userProfile.getFullName());
        response.setDateOfBirth(userProfile.getDateOfBirth());
        response.setCity(userProfile.getCity());
        response.setCountryCode(userProfile.getCountryCode());
        response.setInterests(userProfile.getInterests());
        response.setSocialLinks(userProfile.getSocialLinks());
        response.setPreferences(userProfile.getPreferences());
        response.setPrivacySettings(userProfile.getPrivacySettings());
        response.setCreatedAt(userProfile.getCreatedAt());
        response.setUpdatedAt(userProfile.getUpdatedAt());

        return ResponseEntity.ok(response);
    }


    @PostMapping("/register")
    public ResponseEntity<?> userRegisterAccount(@RequestBody AccountDTO a) {
        try {
            if(!a.getPassword().equals(a.getPasswordConfirm()))
                return ResponseEntity.badRequest().body("Password and Confirm password are not match");

            Account account = new Account();
            account.setRole(Account.Role.USER);
            account.setPasswordHash(a.getPassword());
            account.setEmail(a.getEmail());

            Account accountSaved = this.accountService.addOrUpdateAccount(account);

            UserProfile userProfile = new UserProfile();
            userProfile.setAccountUuid(accountSaved.getUuid());
            userProfile.setUsername(a.getUsername());
            userProfile.setFirstName(a.getFirstName());
            userProfile.setLastName(a.getLastName());
            this.userProfileService.addOrUpdateUserProfile(userProfile);

            String otp = String.valueOf(new Random().nextInt(900000) + 100000);
            otpService.saveOtp(a.getEmail(), otp);
            mailService.sendMail(a.getEmail(),"Mã OTP xác thực", "Mã OTP của bạn là: " + otp + "\nMã này sẽ hết hạn sau 5 phút.");

            return ResponseEntity.ok(accountSaved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error to create new User: " + e.getMessage());
        }
    }


    @PostMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String email, @RequestParam String otp) {
        String cachedOtp = otpService.getOtp(email);

        System.out.println("cachedOtp: " + cachedOtp);

        if (cachedOtp == null) {
            return ResponseEntity.status(404).body("OTP đã hết hạn");
        }

        if (!cachedOtp.equals(otp)) {
            return ResponseEntity.status(400).body("OTP không chính xác");
        }
        Account account = this.accountService.getAccountByEmail(email);
        account.setEmailVerified(Boolean.TRUE);
        this.accountService.addOrUpdateAccount(account);

        String resetToken = UUID.randomUUID().toString();
        otpService.saveResetToken(email, resetToken);

        return ResponseEntity.ok(Map.of(
                "message", "Xác minh OTP thành công",
                "resetToken", resetToken
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {

        Account account = this.accountService.getAccountByEmail(email);

        if(account == null)
            return ResponseEntity.status(404).body("Không tìm thấy account");


        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        otpService.saveOtp(email, otp);
        mailService.sendMail(email,"Mã OTP xác thực", "Mã OTP của bạn là: " + otp + "\nMã này sẽ hết hạn sau 5 phút.");

        return ResponseEntity.ok("OTP đã gửi qua email");
    }

    @PostMapping("/verify-forgot-password")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        String cachedOtp = otpService.getOtp(email);

        if (cachedOtp == null) {
            return ResponseEntity.status(404).body("OTP đã hết hạn");
        }

        if (!cachedOtp.equals(otp)) {
            return ResponseEntity.status(400).body("OTP không chính xác");
        }

        String resetToken = UUID.randomUUID().toString();
        otpService.saveResetToken(email, resetToken);

        return ResponseEntity.ok(Map.of(
                "message", "Xác minh OTP thành công",
                "resetToken", resetToken
        ));
    }

    @PatchMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String resetToken, @RequestParam String password) {
        String email = otpService.getEmailByResetToken(resetToken);

        if (email == null) {
            return ResponseEntity.status(400).body("Reset token không hợp lệ hoặc đã hết hạn");
        }

        Account account = this.accountService.getAccountByEmail(email);
        account.setPasswordHash(password);
        this.accountService.addOrUpdateAccount(account);

        otpService.deleteOtp(resetToken);

        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> payload,
            Principal principal) {
        try {
            String oldPassword = payload.get("oldPassword");
            String newPassword = payload.get("newPassword");
            if (oldPassword == null || oldPassword.trim().isEmpty() ||
                    newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Mật khẩu không được để trống");
            }

            String username = principal.getName();
            Account account = this.accountService.getAccountByEmail(username);
            if (account == null) {
                return ResponseEntity.status(404).body("Không tìm thấy user");
            }

            if (!passwordEncoder.matches(oldPassword, account.getPasswordHash())) {
                return ResponseEntity.status(400).body("Mật khẩu cũ không đúng");
            }

            account.setPasswordHash(newPassword);
            this.accountService.addOrUpdateAccount(account);

            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PatchMapping("/update-info")
    public ResponseEntity<?> updateInformation(
            @RequestPart(value = "avatar", required = false) MultipartFile avatar,
            @RequestPart("data") UserProfileDTO dto,
            Principal principal) {

        try {
            String email = principal.getName();
            Account account = accountService.getAccountByEmail(email);
            if (account == null) {
                return ResponseEntity.status(404).body("Không tìm thấy user");
            }

            UserProfile userProfile = this.userProfileService.findUserProfileById(account.getUuid());


            if (dto.getBio() != null) {
                userProfile.setBio(dto.getBio());
            }
            if (dto.getFirstName() != null) userProfile.setFirstName(dto.getFirstName());
            if (dto.getLastName() != null) userProfile.setLastName(dto.getLastName());
            if (dto.getCity() != null) userProfile.setCity(dto.getCity());

            if (dto.getDateOfBirth() != null && !dto.getDateOfBirth().trim().isEmpty()) {
                try {
                    LocalDate parsedDate = LocalDate.parse(dto.getDateOfBirth().trim()); // format yyyy-MM-dd
                    userProfile.setDateOfBirth(parsedDate);
                } catch (DateTimeParseException e) {
                    return ResponseEntity.badRequest().body("Định dạng ngày sinh không hợp lệ. Vui lòng dùng định dạng YYYY-MM-DD (ví dụ: 1995-12-25)");
                }
            }

            if (avatar != null && !avatar.isEmpty()) {
                String avatarUrl = imageStorageService.upload(avatar);
                userProfile.setAvatarUrl(avatarUrl);
            }

            this.userProfileService.addOrUpdateUserProfile(userProfile);

            return ResponseEntity.ok("Cập nhật thành công");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUser(Principal principal) {
        try {
        String email = principal.getName();
        Account account = this.accountService.getAccountByEmail(email);
        this.disAccountService.addOrUpdateDisAccount(account);
        this.accountService.deleteAccount(account);
        return ResponseEntity.ok("Delete account successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }

}
