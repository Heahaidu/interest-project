package com.aws.services;

import com.aws.pojo.PageFollower;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface PageFollowerService {
    PageFollower findPageFollowerById(UUID uuid);
    PageFollower addOrUpdatePageFollower(PageFollower pageFollower);
    void deletePageFollower(PageFollower pageFollower);
    Page<PageFollower> getPageFollowersByPageUuid(UUID pageUuid, int page, int size);
    Page<PageFollower> getPageFollowersByFollowerUuid(UUID followerlUuid, int page, int size);;
}
