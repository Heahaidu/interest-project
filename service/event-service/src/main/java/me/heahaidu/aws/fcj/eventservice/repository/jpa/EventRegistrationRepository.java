package me.heahaidu.aws.fcj.eventservice.repository.jpa;

import me.heahaidu.aws.fcj.eventservice.repository.entity.EventRegistration;
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
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {

    // ==================== Find Operations ====================

    @Query(value = """
            SELECT * FROM event_registration
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    Optional<EventRegistration> findByUuid(@Param("uuid") UUID uuid);

    @Query(value = """
            SELECT * FROM event_registration
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND user_uuid = CAST(:userUuid AS UUID)
            """, nativeQuery = true)
    Optional<EventRegistration> findByEventAndUser(
            @Param("eventUuid") UUID eventUuid,
            @Param("userUuid") UUID userUuid
    );

    @Query(value = """
            SELECT * FROM event_registration
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND user_uuid = CAST(:userUuid AS UUID)
              AND registration_status = :status
            """, nativeQuery = true)
    Optional<EventRegistration> findByEventAndUserAndStatus(
            @Param("eventUuid") UUID eventUuid,
            @Param("userUuid") UUID userUuid,
            @Param("status") String status
    );

    @Modifying
    @Query(value = """
        UPDATE event_registration
        SET check_in_time = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE uuid = CAST(:uuid AS UUID)
        """, nativeQuery = true)
    void checkInWithStaff(
            @Param("uuid") UUID uuid,
            @Param("staffUuid") UUID staffUuid
    );

    @Query(value = """
            SELECT * FROM event_registration
            WHERE event_uuid = CAST(:eventUuid AS UUID)
            ORDER BY created_at ASC
            """, nativeQuery = true)
    List<EventRegistration> findByEventUuid(@Param("eventUuid") UUID eventUuid);

    @Query(value = """
            SELECT * FROM event_registration
            WHERE user_uuid = CAST(:userUuid AS UUID)
            ORDER BY created_at DESC
            """, nativeQuery = true)
    List<EventRegistration> findByUserUuid(@Param("userUuid") UUID userUuid);

    @Query(value = """
            SELECT * FROM event_registration
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND registration_status = :status
            ORDER BY created_at ASC
            """, nativeQuery = true)
    List<EventRegistration> findByEventUuidAndStatus(
            @Param("eventUuid") UUID eventUuid,
            @Param("status") String status
    );

    @Query(value = """
            SELECT * FROM event_registration
            WHERE user_uuid = CAST(:userUuid AS UUID)
              AND registration_status = :status
            ORDER BY created_at DESC
            """, nativeQuery = true)
    List<EventRegistration> findByUserUuidAndStatus(
            @Param("userUuid") UUID userUuid,
            @Param("status") String status
    );

    // ==================== Exists Operations ====================

    @Query(value = """
            SELECT EXISTS(
                SELECT 1 FROM event_registration
                WHERE event_uuid = CAST(:eventUuid AS UUID)
                  AND user_uuid = CAST(:userUuid AS UUID)
                  AND registration_status = 'REGISTERED'
            )
            """, nativeQuery = true)
    boolean isUserRegistered(
            @Param("eventUuid") UUID eventUuid,
            @Param("userUuid") UUID userUuid
    );

    // ==================== Status Updates ====================

    @Modifying
    @Query(value = """
            UPDATE event_registration
            SET registration_status = :status,
                updated_at = CURRENT_TIMESTAMP
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    void updateStatus(
            @Param("uuid") UUID uuid,
            @Param("status") String status
    );

    @Modifying
    @Query(value = """
            UPDATE event_registration
            SET registration_status = 'CANCELLED',
                cancellation_reason = :reason,
                updated_at = CURRENT_TIMESTAMP
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    void cancelRegistration(
            @Param("uuid") UUID uuid,
            @Param("reason") String reason
    );

    @Modifying
    @Query(value = """
            UPDATE event_registration
            SET registration_status = 'CANCELLED',
                cancellation_reason = :reason,
                updated_at = CURRENT_TIMESTAMP
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND registration_status = 'REGISTERED'
            """, nativeQuery = true)
    int cancelAllRegistrationsByEvent(
            @Param("eventUuid") UUID eventUuid,
            @Param("reason") String reason
    );

    // ==================== Check-in Operations ====================

    @Modifying
    @Query(value = """
            UPDATE event_registration
            SET check_in_time = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    void checkIn(@Param("uuid") UUID uuid);

    @Modifying
    @Query(value = """
            UPDATE event_registration
            SET check_out_time = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    void checkOut(@Param("uuid") UUID uuid);

    @Query(value = """
            SELECT * FROM event_registration
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND check_in_time IS NOT NULL
            ORDER BY check_in_time ASC
            """, nativeQuery = true)
    List<EventRegistration> findByEventUuidAndCheckedIn(@Param("eventUuid") UUID eventUuid);

    // ==================== Attendance Operations ====================

    @Modifying
    @Query(value = """
            UPDATE event_registration
            SET registration_status = 'ATTENDED',
                updated_at = CURRENT_TIMESTAMP
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    void markAsAttended(@Param("uuid") UUID uuid);

    @Modifying
    @Query(value = """
            UPDATE event_registration
            SET registration_status = 'NO_SHOW',
                updated_at = CURRENT_TIMESTAMP
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    void markAsNoShow(@Param("uuid") UUID uuid);

    @Modifying
    @Query(value = """
            UPDATE event_registration
            SET registration_status = 'NO_SHOW',
                updated_at = CURRENT_TIMESTAMP
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND registration_status = 'REGISTERED'
              AND check_in_time IS NULL
            """, nativeQuery = true)
    int markAllNoShowsByEvent(@Param("eventUuid") UUID eventUuid);

    // ==================== Payment Operations ====================

    @Modifying
    @Query(value = """
            UPDATE event_registration
            SET payment_transaction_uuid = CAST(:paymentUuid AS UUID),
                updated_at = CURRENT_TIMESTAMP
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    void updatePaymentTransaction(
            @Param("uuid") UUID uuid,
            @Param("paymentUuid") UUID paymentUuid
    );

    @Query(value = """
            SELECT * FROM event_registration
            WHERE payment_transaction_uuid = CAST(:paymentUuid AS UUID)
            """, nativeQuery = true)
    Optional<EventRegistration> findByPaymentTransactionUuid(@Param("paymentUuid") UUID paymentUuid);

    @Modifying
    @Query(value = """
            UPDATE event_registration
            SET registration_status = 'REFUNDED',
                updated_at = CURRENT_TIMESTAMP
            WHERE uuid = CAST(:uuid AS UUID)
            """, nativeQuery = true)
    void markAsRefunded(@Param("uuid") UUID uuid);

    // ==================== Bulk Operations ====================

    @Modifying
    @Query(value = """
            DELETE FROM event_registration
            WHERE event_uuid = CAST(:eventUuid AS UUID)
            """, nativeQuery = true)
    void deleteAllByEventUuid(@Param("eventUuid") UUID eventUuid);

    // ==================== Statistics ====================

    @Query(value = """
            SELECT registration_status, COUNT(*)
            FROM event_registration
            WHERE event_uuid = CAST(:eventUuid AS UUID)
            GROUP BY registration_status
            """, nativeQuery = true)
    List<Object[]> getRegistrationStatsByEvent(@Param("eventUuid") UUID eventUuid);

    @Query(value = """
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM event_registration
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND created_at >= CAST(:from AS TIMESTAMP)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
            """, nativeQuery = true)
    List<Object[]> getDailyRegistrationStats(
            @Param("eventUuid") UUID eventUuid,
            @Param("from") Instant from
    );

    // ==================== Count Operations ====================

    @Query(value = """
            SELECT COUNT(*)
            FROM event_registration
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND registration_status = 'REGISTERED'
            """, nativeQuery = true)
    Long countActiveRegistrations(@Param("eventUuid") UUID eventUuid);

    @Query(value = """
            SELECT COUNT(*)
            FROM event_registration
            WHERE event_uuid = CAST(:eventUuid AS UUID)
              AND check_in_time IS NOT NULL
            """, nativeQuery = true)
    Long countCheckedIn(@Param("eventUuid") UUID eventUuid);
}