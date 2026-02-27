package com.aws.services;

import com.aws.pojo.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.UUID;

public interface AccountService extends UserDetailsService {
    Account addOrUpdateAccount(Account a);
    Account getAccountByEmail(String email);
    boolean authenticate(String email, String password);
    void deleteAccount(Account a);
    Account getAccountByUUID(UUID uuid);

    Page<Account> findAllAccount(int page, int size);
}
