package me.heahaidu.aws.fcj.eventservice.client;

import java.util.UUID;

public interface PageServiceClient {

    /**
     * Check if user have permission to create a new event
     * @param userUuid
     * @param pageUuid
     * @return
     */
    boolean canUserCreateEvent(UUID userUuid, UUID pageUuid);

    /**
     * Check if user have permission to delete event
     * @param userUuid
     * @param pageUuid
     * @return
     */
    boolean canUserDeleteEvent(UUID userUuid, UUID pageUuid);

    /**
     * Check if user have permission to change info of the event
     * @param userUuid
     * @param pageUuid
     * @return
     */
    boolean canUserUpdateEvent(UUID userUuid, UUID pageUuid);

    /**
     * Check if page exist
     * @param pageUuid
     * @return
     */
    boolean isPageExist(UUID pageUuid);
}
