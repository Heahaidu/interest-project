package com.aws.services;

import com.aws.pojo.DisAccount;

public interface DisAccountService {
    DisAccount addOrUpdateDisAccount(DisAccount disAccount);
    void deleteDisAccount(DisAccount disAccount);


}
