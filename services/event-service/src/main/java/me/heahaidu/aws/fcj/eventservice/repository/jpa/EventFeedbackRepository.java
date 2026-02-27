package me.heahaidu.aws.fcj.eventservice.repository.jpa;

import me.heahaidu.aws.fcj.eventservice.repository.entity.EventFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventFeedbackRepository extends JpaRepository<EventFeedback, UUID> {

    // ==================== Find Operations ====================

    @Query(value = """
            SELECT * FROM event_feedback
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    Optional<EventFeedback> findByUuid(@Param("uuid") UUID uuid);

    @Query(value = """
            SELECT * FROM event_feedback
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND user_uuid = CAST(:userUuid AS UUID)
            """, nativeQuery = true)
    Optional<EventFeedback> findByEventAndUser(
            @Param("eventUuid") UUID eventUuid,
            @Param("userUuid") UUID userUuid
    );

    @Query(value = """
            SELECT * FROM event_feedback
            WHERE event_uuid = CAST(:eventUuid AS UUID)
            ORDER BY created_at DESC
            """, nativeQuery = true)
    List<EventFeedback> findByEventUuid(@Param("eventUuid") UUID eventUuid);

    @Query(value = """
            SELECT * FROM event_feedback
            WHERE user_uuid = CAST(:userUuid AS UUID)
            ORDER BY created_at DESC
            """, nativeQuery = true)
    List<EventFeedback> findByUserUuid(@Param("userUuid") UUID userUuid);

    @Query(value = """
            SELECT * FROM event_feedback
            WHERE event_uuid = CAST(:eventUuid AS UUID)
            ORDER BY helpful_count DESC, created_at DESC
            """, nativeQuery = true)
    List<EventFeedback> findByEventUuidOrderByHelpful(@Param("eventUuid") UUID eventUuid);

    @Query(value = """
            SELECT * FROM event_feedback
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND rating >= :minRating
            ORDER BY created_at DESC
            """, nativeQuery = true)
    List<EventFeedback> findByEventUuidAndMinRating(
            @Param("eventUuid") UUID eventUuid,
            @Param("minRating") Short minRating
    );

    @Query(value = """
            SELECT * FROM event_feedback
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND sentiment = :sentiment
            ORDER BY created_at DESC
            """, nativeQuery = true)
    List<EventFeedback> findByEventUuidAndSentiment(
            @Param("eventUuid") UUID eventUuid,
            @Param("sentiment") String sentiment
    );

    // ==================== Exists Operations ====================

    @Query(value = """
            SELECT EXISTS(
                SELECT 1 FROM event_feedback
                WHERE event_uuid = CAST(:eventUuid AS UUID)
                  AND user_uuid = CAST(:userUuid AS UUID)
            )
            """, nativeQuery = true)
    boolean existsByEventAndUser(
            @Param("eventUuid") UUID eventUuid,
            @Param("userUuid") UUID userUuid
    );

    // ==================== Count & Statistics ====================

    @Query(value = """
            SELECT COUNT(*)
            FROM event_feedback
            WHERE event_uuid = CAST(:eventUuid AS UUID)
            """, nativeQuery = true)
    Long countByEventUuid(@Param("eventUuid") UUID eventUuid);

    @Query(value = """
            SELECT AVG(rating)
            FROM event_feedback
            WHERE event_uuid = CAST(:eventUuid AS UUID)
            """, nativeQuery = true)
    Double getAverageRatingByEventUuid(@Param("eventUuid") UUID eventUuid);

    @Query(value = """
            SELECT rating, COUNT(*)
            FROM event_feedback
            WHERE event_uuid = CAST(:eventUuid AS UUID)
            GROUP BY rating
            ORDER BY rating DESC
            """, nativeQuery = true)
    List<Object[]> getRatingDistributionByEventUuid(@Param("eventUuid") UUID eventUuid);

    @Query(value = """
            SELECT sentiment, COUNT(*)
            FROM event_feedback
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND sentiment IS NOT NULL
            GROUP BY sentiment
            """, nativeQuery = true)
    List<Object[]> getSentimentDistributionByEventUuid(@Param("eventUuid") UUID eventUuid);

    @Query(value = """
            SELECT UNNEST(tags) as tag, COUNT(*) as count
            FROM event_feedback
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND tags IS NOT NULL
            GROUP BY tag
            ORDER BY count DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> getTopTagsByEventUuid(
            @Param("eventUuid") UUID eventUuid,
            @Param("limit") int limit
    );

    // ==================== Update Operations ====================

    @Modifying
    @Query(value = """
            UPDATE event_feedback
            SET helpful_count = helpful_count + 1
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    void incrementHelpfulCount(@Param("uuid") UUID uuid);

    @Modifying
    @Query(value = """
            UPDATE event_feedback
            SET sentiment = :sentiment,
                sentiment_confidence = :confidence
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    void updateSentiment(
            @Param("uuid") UUID uuid,
            @Param("sentiment") String sentiment,
            @Param("confidence") BigDecimal confidence
    );

    @Modifying
    @Query(value = """
            UPDATE event_feedback
            SET rating = :rating,
                comment = :comment,
                tags = CAST(:tags AS TEXT[])
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    void updateFeedback(
            @Param("uuid") UUID uuid,
            @Param("rating") Short rating,
            @Param("comment") String comment,
            @Param("tags") String tags
    );

    // ==================== Insert Operations ====================

    @Query(value = """
            INSERT INTO event_feedback (
                event_uuid,
                user_uuid,
                rating,
                comment,
                sentiment,
                sentiment_confidence,
                tags
            ) VALUES (
                CAST(:eventUuid AS UUID),
                CAST(:userUuid AS UUID),
                :rating,
                :comment,
                :sentiment,
                :sentimentConfidence,
                CAST(:tags AS TEXT[])
            )
            RETURNING *
            """, nativeQuery = true)
    EventFeedback insertFeedback(
            @Param("eventUuid") UUID eventUuid,
            @Param("userUuid") UUID userUuid,
            @Param("rating") Short rating,
            @Param("comment") String comment,
            @Param("sentiment") String sentiment,
            @Param("sentimentConfidence") BigDecimal sentimentConfidence,
            @Param("tags") String tags
    );

    // ==================== Delete Operations ====================

    @Modifying
    @Query(value = """
            DELETE FROM event_feedback
            WHERE event_uuid = CAST(:eventUuid AS UUID)
            """, nativeQuery = true)
    void deleteAllByEventUuid(@Param("eventUuid") UUID eventUuid);

    @Modifying
    @Query(value = """
            DELETE FROM event_feedback
            WHERE uuid = CAST(:uuid AS UUID)
              AND user_uuid = CAST(:userUuid AS UUID)
            """, nativeQuery = true)
    int deleteByUuidAndUserUuid(
            @Param("uuid") UUID uuid,
            @Param("userUuid") UUID userUuid
    );
}