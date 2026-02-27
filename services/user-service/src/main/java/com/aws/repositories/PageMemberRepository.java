package com.aws.repositories;

import com.aws.pojo.PageMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PageMemberRepository extends JpaRepository<PageMember, UUID> {

    Page<PageMember> findByPageUuid(UUID pageUuid, Pageable pageable);
    Page<PageMember> findByUserUuid(UUID userUuid, Pageable pageable);
    Page<PageMember> findByInvitationStatus(String invitationStatus, Pageable pageable);
}
