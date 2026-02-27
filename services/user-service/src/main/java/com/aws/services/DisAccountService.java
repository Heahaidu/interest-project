package com.aws.services;

import com.aws.pojo.Account;
import com.aws.pojo.DisAccount;

public interface DisAccountService {
    DisAccount addOrUpdateDisAccount(Account account);
    void deleteDisAccount(DisAccount disAccount);
}
