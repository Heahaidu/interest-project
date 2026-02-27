package com.aws.repositories;

import com.aws.pojo.EventVectorChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventVectorChunkRepository extends JpaRepository<EventVectorChunk, UUID> {
    // Lấy tất cả chunk của 1 sự kiện
    List<EventVectorChunk> findBySourceEventUuid(UUID eventUuid);
}
