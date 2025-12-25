package com.aws.repositories;

import com.aws.pojo.PageFollower;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PageFollowerRepository extends JpaRepository<PageFollower, UUID> {

    Page<PageFollower> findByNotificationEnabled(Boolean enabled, Pageable pageable);
    Page<PageFollower> findByPageUuid(UUID pageUuid, Pageable pageable);
    Page<PageFollower> findByFollowerUuid(UUID followerUuid, Pageable pageable);
}
