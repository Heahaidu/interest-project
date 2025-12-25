package me.heahaidu.aws.fcj.eventservice.repository.jpa;

import me.heahaidu.aws.fcj.eventservice.repository.dto.EventProjection;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventInterestRepository extends JpaRepository<EventInterest, UUID> {

    boolean existsByEventUuidAndUserUuid(UUID eventUuid, UUID userUuid);

    Optional<EventInterest> findByEventUuidAndUserUuid(UUID eventUuid, UUID userUuid);

    @Modifying
    @Query("""
        DELETE FROM EventInterest WHERE eventUuid = :eventUuid AND userUuid = :userUuid
    """)
    int deleteByEventUuidAndUserUuid(@Param("eventUuid") UUID eventUuid, @Param("userUuid") UUID userUuid);

    @Query(value = """
        SELECT 
                e.uuid                      AS eventUuid,
                e.created_by                AS createdBy,
                e.current_participants      AS currentParticipants,
                e.max_participants          AS maxParticipants,
                ec.title                    AS title,
                ec.start_time               AS startTime,
                ec.end_time                 AS endTime,
                ec.location                 AS location,
                ec.city                     AS city,
                ec.country_code             AS countryCode,
                ec.category                 AS category,
                ec.image_urls               AS imageUrls
        FROM event_interest ei
        JOIN event e ON e.uuid = ei.event_uuid
        JOIN event_content ec ON e.current_version_uuid = ec.uuid
        WHERE ei.user_uuid = CAST(:userUuid AS UUID)
            AND e.deleted_at IS NULL AND e.status = 'PUBLISHED'
            AND e.visibility = 'PUBLIC'
    """, nativeQuery = true)
    List<EventProjection> findAllEventUserInterest(@Param("userUuid") UUID userUuid);
}
