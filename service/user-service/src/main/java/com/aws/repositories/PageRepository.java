package com.aws.repositories;

import com.aws.pojo.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PageRepository extends JpaRepository<Page, UUID> {

    org.springframework.data.domain.Page<Page> findByName(String name, Pageable pageable);

    org.springframework.data.domain.Page<Page> findByOwnerUuid(UUID ownerUuid, Pageable pageable);
}
