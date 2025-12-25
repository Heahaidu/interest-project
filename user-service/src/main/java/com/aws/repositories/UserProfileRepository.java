package com.aws.repositories;

import com.aws.pojo.Account;
import com.aws.pojo.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {

//    UserProfile findByAccount(Account account);
//
//    UserProfile findByAccountUuid(UUID accountUuid);
//
//    Page<UserProfile> findByFirstNameContainingIgnoreCase(String firstName);
//
//    Page<UserProfile> findByLastNameContainingIgnoreCase(String lastName);
//
//    Page<UserProfile> findByCity(String city);
//
//    Page<UserProfile> findByCityContainingIgnoreCase(String city);
}
