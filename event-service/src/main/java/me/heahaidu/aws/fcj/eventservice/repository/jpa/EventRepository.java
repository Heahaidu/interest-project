package me.heahaidu.aws.fcj.eventservice.repository.jpa;

import me.heahaidu.aws.fcj.eventservice.enums.EventStatus;
import me.heahaidu.aws.fcj.eventservice.repository.entity.Event;
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
public interface EventRepository extends JpaRepository<Event, UUID> {

    // ==================== Find Operations ====================

    @Query("SELECT e FROM Event e WHERE e.uuid = :uuid AND e.deletedAt IS NULL")
    Optional<Event> findByUuidAndNotDeleted(@Param("uuid") UUID uuid);

    @Query("SELECT e FROM Event e WHERE e.uuid = :uuid AND e.status = :status AND e.deletedAt IS NULL")
    Optional<Event> findByUuidAndStatusAndNotDeleted(
            @Param("uuid") UUID uuid,
            @Param("status") EventStatus status
    );

    @Query("""
            SELECT e FROM Event e
            WHERE e.status = 'PUBLISHED'
              AND e.visibility = 'PUBLIC'
              AND e.deletedAt IS NULL
            ORDER BY e.createdAt DESC
            """)
    List<Event> findPublicPublishedEvents();

    // ==================== Exists Operations ====================

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Event e WHERE e.uuid = :uuid AND e.deletedAt IS NULL")
    boolean existsByUuidAndNotDeleted(@Param("uuid") UUID uuid);

    // ==================== Count Operations ====================

    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = :status AND e.deletedAt IS NULL")
    Long countByStatus(@Param("status") EventStatus status);

    // ==================== Update Participant Counts ====================

    @Modifying
    @Query("UPDATE Event e SET e.currentParticipants = e.currentParticipants + 1 WHERE e.uuid = :uuid")
    void incrementParticipants(@Param("uuid") UUID uuid);

    @Modifying
    @Query("UPDATE Event e SET e.currentParticipants = e.currentParticipants - 1 WHERE e.uuid = :uuid AND e.currentParticipants > 0")
    void decrementParticipants(@Param("uuid") UUID uuid);

    // ==================== Status Updates ====================

    @Modifying
    @Query("UPDATE Event e SET e.status = :status, e.updatedAt = CURRENT_TIMESTAMP WHERE e.uuid = :uuid")
    void updateStatus(@Param("uuid") UUID uuid, @Param("status") EventStatus status);

    @Modifying
    @Query("""
            UPDATE Event e
            SET e.status = 'PUBLISHED',
                e.publishedBy = :publishedBy,
                e.publishedAt = CURRENT_TIMESTAMP,
                e.updatedAt = CURRENT_TIMESTAMP
            WHERE e.uuid = :uuid
            """)
    void publishEvent(@Param("uuid") UUID uuid, @Param("publishedBy") UUID publishedBy);

    @Modifying
    @Query("""
            UPDATE Event e
            SET e.status = 'CANCELLED',
                e.updatedAt = CURRENT_TIMESTAMP
            WHERE e.uuid = :uuid
            """)
    void cancelEvent(@Param("uuid") UUID uuid);

    // ==================== Soft Delete ====================

    @Modifying
    @Query("UPDATE Event e SET e.deletedAt = CURRENT_TIMESTAMP, e.updatedAt = CURRENT_TIMESTAMP WHERE e.uuid = :uuid")
    void softDelete(@Param("uuid") UUID uuid);

    @Modifying
    @Query("UPDATE Event e SET e.deletedAt = NULL, e.updatedAt = CURRENT_TIMESTAMP WHERE e.uuid = :uuid")
    void restore(@Param("uuid") UUID uuid);

    // ==================== Native Queries for Complex Operations ====================

    @Query(value = """
            SELECT e.* FROM event e
            JOIN event_content ec ON ec.uuid = e.current_version_uuid
            WHERE e.deleted_at IS NULL
              AND e.status = 'PUBLISHED'
              AND e.visibility = 'PUBLIC'
              AND ec.start_time >= CAST(:from AS TIMESTAMP)
              AND ec.start_time <= CAST(:to AS TIMESTAMP)
              AND (
                COALESCE(CAST(:city AS TEXT), '') = ''
                OR ec.city ILIKE CAST(:city AS TEXT)
              )
              AND (
                COALESCE(CAST(:category AS TEXT), '') = ''
                OR ec.category ILIKE CAST(:category AS TEXT)
              )
            ORDER BY ec.start_time ASC
            LIMIT CAST(:limit AS INTEGER)
            OFFSET CAST(:offset AS INTEGER)
            """, nativeQuery = true)
    List<Event> findUpcomingEvents(
            @Param("from") Instant from,
            @Param("to") Instant to,
            @Param("city") String city,
            @Param("category") String category,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    @Query(value = """
            SELECT COUNT(*) FROM event e
            JOIN event_content ec ON ec.uuid = e.current_version_uuid
            WHERE e.deleted_at IS NULL
              AND e.status = 'PUBLISHED'
              AND e.visibility = 'PUBLIC'
              AND ec.start_time >= CAST(:from AS TIMESTAMP)
              AND ec.start_time <= CAST(:to AS TIMESTAMP)
              AND (
                COALESCE(CAST(:city AS TEXT), '') = ''
                OR ec.city ILIKE CAST(:city AS TEXT)
              )
              AND (
                COALESCE(CAST(:category AS TEXT), '') = ''
                OR ec.category ILIKE CAST(:category AS TEXT)
              )
            """, nativeQuery = true)
    Long countUpcomingEvents(
            @Param("from") Instant from,
            @Param("to") Instant to,
            @Param("city") String city,
            @Param("category") String category
    );

    @Query(value = """
            SELECT e.* FROM event e
            JOIN event_content ec ON ec.uuid = e.current_version_uuid
            WHERE e.deleted_at IS NULL
              AND e.status = 'PUBLISHED'
              AND e.visibility = 'PUBLIC'
              AND (
                ec.title ILIKE CONCAT('%', CAST(:keyword AS TEXT), '%')
                OR ec.description ILIKE CONCAT('%', CAST(:keyword AS TEXT), '%')
                OR ec.location ILIKE CONCAT('%', CAST(:keyword AS TEXT), '%')
                OR ec.city ILIKE CONCAT('%', CAST(:keyword AS TEXT), '%')
              )
            ORDER BY ec.start_time ASC
            LIMIT CAST(:limit AS INTEGER)
            """, nativeQuery = true)
    List<Event> searchEvents(@Param("keyword") String keyword, @Param("limit") int limit);
}