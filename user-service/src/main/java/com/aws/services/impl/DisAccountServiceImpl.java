package com.aws.services.impl;

import com.aws.pojo.Account;
import com.aws.pojo.DisAccount;
import com.aws.repositories.DisAccountRepository;
import com.aws.repositories.UserProfileRepository;
import com.aws.services.DisAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class DisAccountServiceImpl implements DisAccountService {

    private final DisAccountRepository disAccountRepository;


    @Override
    public DisAccount addOrUpdateDisAccount(Account account) {
        DisAccount dis = new DisAccount();
        BeanUtils.copyProperties(account, dis);
        return this.disAccountRepository.save(dis);
    }

    @Override
    public void deleteDisAccount(DisAccount disAccount) {
        this.disAccountRepository.delete(disAccount);
    }
}
