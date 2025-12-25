package com.aws.services;

import com.aws.pojo.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PageService {
    public Page getPageByUuid(UUID uuid);
    org.springframework.data.domain.Page<Page> searchPagesByName(String name, int page, int size);
    Page addOrUpdatePage(Page page);
    void deletePage(Page page);
    org.springframework.data.domain.Page<Page> getPagesByOwner(UUID ownerUuid, int page, int size);
    public void increaseFollowerCount(UUID uuid);
    public void decreaseFollowerCount(UUID uuid);
    public void increaseEventCount(UUID uuid);
    public void decreaseEventCount(UUID uuid);
    public void verifyPage(UUID uuid);
    org.springframework.data.domain.Page<Page> getAllPages(Pageable pageable);
    Page getPageDetail(UUID pageUuid);
}
