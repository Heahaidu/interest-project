package com.aws.repositories;


import com.aws.pojo.DisAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DisAccountRepository extends JpaRepository<DisAccount, UUID> {
    Page<DisAccount> findAll(Pageable pageable);

}
