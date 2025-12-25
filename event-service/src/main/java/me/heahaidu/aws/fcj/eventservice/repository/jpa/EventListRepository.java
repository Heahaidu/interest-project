package me.heahaidu.aws.fcj.eventservice.repository.jpa;

import me.heahaidu.aws.fcj.eventservice.enums.EventStatus;
import me.heahaidu.aws.fcj.eventservice.enums.EventVisibility;
import me.heahaidu.aws.fcj.eventservice.repository.dto.EventProjection;
import me.heahaidu.aws.fcj.eventservice.repository.entity.Event;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventListRepository extends JpaRepository<Event, UUID> {
    @Query(value = """
            SELECT
                e.uuid                      AS eventUuid,
                e.created_by                 AS createdBy,
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
            FROM event e
            JOIN event_content ec ON ec.uuid = e.current_version_uuid
            WHERE e.deleted_at IS NULL
              AND e.status = 'PUBLISHED'
              AND e.visibility = 'PUBLIC'
              AND (CAST(:from AS TIMESTAMP) IS NULL OR ec.start_time >= CAST(:from AS TIMESTAMP))
              AND (CAST(:to AS TIMESTAMP) IS NULL OR ec.start_time <= CAST(:to AS TIMESTAMP))
              AND (
                CAST(:search AS TEXT) IS NULL OR
                ec.title ILIKE CONCAT('%', CAST(:search AS TEXT), '%') OR
                ec.description ILIKE CONCAT('%', CAST(:search AS TEXT), '%') OR
                ec.location ILIKE CONCAT('%', CAST(:search AS TEXT), '%') OR
                ec.city ILIKE CONCAT('%', CAST(:search AS TEXT), '%')
              )
              AND (
                CAST(:cursorStart AS TIMESTAMP) IS NULL
                OR ec.start_time < CAST(:cursorStart AS TIMESTAMP)
                OR (ec.start_time = CAST(:cursorStart AS TIMESTAMP) AND e.uuid < CAST(:cursorUuid AS UUID))
              )
            ORDER BY ec.start_time DESC, e.uuid DESC
            LIMIT CAST(:limit AS INTEGER)
            """, nativeQuery = true)
    Optional<List<EventProjection>> findEventsKeyset(
            @Param("from") Instant from,
            @Param("to") Instant to,
            @Param("search") String search,
            @Param("cursorStart") Instant cursorStart,
            @Param("cursorUuid") UUID cursorUuid,
            @Param("limit") int limit
    );
}