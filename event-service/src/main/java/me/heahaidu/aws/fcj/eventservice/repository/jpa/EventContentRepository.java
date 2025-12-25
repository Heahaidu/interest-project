package me.heahaidu.aws.fcj.eventservice.repository.jpa;

import me.heahaidu.aws.fcj.eventservice.repository.dto.EventContentProjection;
import me.heahaidu.aws.fcj.eventservice.repository.entity.Event;
import me.heahaidu.aws.fcj.eventservice.repository.entity.EventContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventContentRepository extends JpaRepository<EventContent, UUID> {
    @Query(value =
            """
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
                ec.image_urls               AS imageUrls,
                ec.price                    AS price,
                ec.currency                 AS currency,
                ec.description              AS description
            FROM event e
            JOIN event_content ec ON ec.uuid = e.current_version_uuid
            WHERE CAST(:event_uuid as UUID) IS NOT NULL AND CAST(:event_uuid as UUID) = e.uuid
            """, nativeQuery = true
    )
    EventContentProjection findByEventByUuid(@Param("event_uuid") UUID event_uuid);

    Optional<EventContent> findByUuid(UUID uuid);

    @Query("SELECT ec FROM EventContent ec WHERE ec.eventUuid = :eventUuid AND ec.isCurrentVersion = true")
    Optional<EventContent> findCurrentVersionByEventUuid(@Param("eventUuid") UUID eventUuid);

//    @Query("SELECT ec FROM EventContent ec WHERE ec.eventUuid = :eventUuid ORDER BY ec.versionNumber DESC")
//    List<EventContent> findAllVersionsByEventUuid(@Param("eventUuid") UUID eventUuid);
//
//    @Query("SELECT ec FROM EventContent ec WHERE ec.eventUuid = :eventUuid AND ec.versionNumber = :version")
//    Optional<EventContent> findByEventUuidAndVersion(
//            @Param("eventUuid") UUID eventUuid,
//            @Param("version") Integer version
//    );

    @Query("SELECT ec FROM EventContent ec WHERE ec.editedBy = :userUuid ORDER BY ec.createdAt DESC")
    List<EventContent> findByEditedBy(@Param("userUuid") UUID userUuid);

    // ==================== Version Operations ====================

//    @Query("SELECT COALESCE(MAX(ec.versionNumber), 0) FROM EventContent ec WHERE ec.eventUuid = :eventUuid")
//    Integer findMaxVersionByEventUuid(@Param("eventUuid") UUID eventUuid);

    @Query("SELECT COUNT(ec) FROM EventContent ec WHERE ec.eventUuid = :eventUuid")
    Long countVersionsByEventUuid(@Param("eventUuid") UUID eventUuid);

    @Modifying
    @Query("UPDATE EventContent ec SET ec.isCurrentVersion = false WHERE ec.eventUuid = :eventUuid")
    void markAllVersionsAsNotCurrent(@Param("eventUuid") UUID eventUuid);

    @Modifying
    @Query("UPDATE EventContent ec SET ec.isCurrentVersion = true WHERE ec.uuid = :uuid")
    void markAsCurrent(@Param("uuid") UUID uuid);

    // ==================== Search & Filter ====================

    @Query("""
            SELECT ec FROM EventContent ec
            WHERE ec.isCurrentVersion = true
              AND ec.category = :category
            ORDER BY ec.startTime ASC
            """)
    List<EventContent> findCurrentVersionsByCategory(@Param("category") String category);

    @Query("""
            SELECT ec FROM EventContent ec
            WHERE ec.isCurrentVersion = true
              AND ec.city = :city
            ORDER BY ec.startTime ASC
            """)
    List<EventContent> findCurrentVersionsByCity(@Param("city") String city);

    @Query("""
            SELECT ec FROM EventContent ec
            WHERE ec.isCurrentVersion = true
              AND ec.startTime BETWEEN :from AND :to
            ORDER BY ec.startTime ASC
            """)
    List<EventContent> findCurrentVersionsByTimeRange(
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    @Query(value = """
            SELECT ec.* FROM event_content ec
            WHERE ec.is_current_version = true
              AND :tag = ANY(ec.tags)
            ORDER BY ec.start_time ASC
            """, nativeQuery = true)
    List<EventContent> findCurrentVersionsByTag(@Param("tag") String tag);

    // ==================== Exists Operations ====================

    @Query("SELECT CASE WHEN COUNT(ec) > 0 THEN true ELSE false END FROM EventContent ec WHERE ec.eventUuid = :eventUuid")
    boolean existsByEventUuid(@Param("eventUuid") UUID eventUuid);

    // ==================== Delete Operations ====================

    @Modifying
    @Query("DELETE FROM EventContent ec WHERE ec.eventUuid = :eventUuid")
    void deleteAllByEventUuid(@Param("eventUuid") UUID eventUuid);
}