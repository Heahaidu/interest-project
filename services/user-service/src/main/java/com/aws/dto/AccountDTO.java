package com.aws.dto;

import lombok.Data;

@Data
public class AccountDTO {
    private String email;
    private String password;
    private String passwordConfirm;
    private String username;
    private String firstName;
    private String lastName;
}
