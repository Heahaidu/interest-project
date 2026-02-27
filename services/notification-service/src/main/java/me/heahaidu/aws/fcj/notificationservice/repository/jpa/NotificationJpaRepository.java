package me.heahaidu.aws.fcj.notificationservice.repository.jpa;

import me.heahaidu.aws.fcj.notificationservice.repository.entity.NotificationEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface NotificationJpaRepository extends JpaRepository<NotificationEntity, UUID> {

    @Query("""
    select n
    from NotificationEntity n
    where n.userUuid = :userUuid
      and n.deletedAt is null
      and (n.expiresAt is null or n.expiresAt > :now)
    order by n.createdAt desc, n.uuid desc
  """)
    List<NotificationEntity> firstPage(@Param("userUuid") UUID userUuid,
                                       @Param("now") Instant now,
                                       Pageable pageable);

    @Query("""
    select n
    from NotificationEntity n
    where n.userUuid = :userUuid
      and n.deletedAt is null
      and (n.expiresAt is null or n.expiresAt > :now)
      and (n.createdAt < :cursorCreatedAt or (n.createdAt = :cursorCreatedAt and n.uuid < :cursorUuid))
    order by n.createdAt desc, n.uuid desc
  """)
    List<NotificationEntity> nextPage(@Param("userUuid") UUID userUuid,
                                      @Param("now") Instant now,
                                      @Param("cursorCreatedAt") Instant cursorCreatedAt,
                                      @Param("cursorUuid") UUID cursorUuid,
                                      Pageable pageable);
}