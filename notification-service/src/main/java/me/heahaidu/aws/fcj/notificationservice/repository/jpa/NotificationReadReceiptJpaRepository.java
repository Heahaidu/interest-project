package me.heahaidu.aws.fcj.notificationservice.repository.jpa;

import me.heahaidu.aws.fcj.notificationservice.repository.entity.NotificationReadReceiptEntity;
import me.heahaidu.aws.fcj.notificationservice.repository.entity.NotificationReadReceiptId;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface NotificationReadReceiptJpaRepository
        extends JpaRepository<NotificationReadReceiptEntity, NotificationReadReceiptId> {

    @Query("""
    select rr
    from NotificationReadReceiptEntity rr
    where rr.id.userUuid = :userUuid
      and rr.id.notificationId in :ids
  """)
    List<NotificationReadReceiptEntity> findByUserAndIds(@Param("userUuid") UUID userUuid,
                                                         @Param("ids") Collection<UUID> ids);

    @Modifying
    @Query(value = """
    insert into notification_read_receipt(user_uuid, notification_id, read_at)
    values (:userUuid, :notificationId, timezone('UTC', now()))
    on conflict (user_uuid, notification_id) do nothing
  """, nativeQuery = true)
    int insertIgnore(@Param("userUuid") UUID userUuid, @Param("notificationId") UUID notificationId);
}