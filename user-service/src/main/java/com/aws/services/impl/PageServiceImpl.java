package com.aws.services.impl;

import com.aws.pojo.Account;
import com.aws.pojo.Page;
import com.aws.repositories.AccountRepository;
import com.aws.repositories.PageRepository;
import com.aws.services.PageService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class PageServiceImpl implements PageService {

    @Autowired
    private PageRepository pageRepository;

    @Override
    public Page getPageByUuid(UUID uuid) {
        Optional<Page> page = pageRepository.findById(uuid);
        return page.orElse(null);
    }

    @Override
    public org.springframework.data.domain.Page<Page> searchPagesByName(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("uuid"));
        return this.pageRepository.findByName(name, pageable);
    }

    @Override
    public Page addOrUpdatePage(Page page) {
        if (page.getUuid() == null) {
            //create

        } else {
            //update
        }
        return this.pageRepository.save(page);
    }

    @Transactional
    @Override
    public void deletePage(Page page) {

        this.pageRepository.delete(page);

        //Tìm các member và follower để xóa theo luôn
    }

    @Override
    public org.springframework.data.domain.Page<Page> getPagesByOwner(UUID ownerUuid, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return pageRepository.findByOwnerUuid(ownerUuid, pageable);
    }

    @Override
    public void increaseFollowerCount(UUID uuid) {
        pageRepository.findById(uuid).ifPresent(page -> {
            page.setFollowerCount(page.getFollowerCount() + 1);
            pageRepository.save(page);
        });
    }

    @Override
    public void decreaseFollowerCount(UUID uuid) {
        pageRepository.findById(uuid).ifPresent(page -> {
            int current = page.getFollowerCount();
            if (current > 0) {
                page.setFollowerCount(current - 1);
                pageRepository.save(page);
            }
        });
    }

    @Override
    public void increaseEventCount(UUID uuid) {
        pageRepository.findById(uuid).ifPresent(page -> {
            page.setEventCount(page.getEventCount() + 1);
            pageRepository.save(page);
        });
    }

    @Override
    public void decreaseEventCount(UUID uuid) {
        pageRepository.findById(uuid).ifPresent(page -> {
            int current = page.getEventCount();
            if (current > 0) {
                page.setEventCount(current - 1);
                pageRepository.save(page);
            }
        });
    }

    @Override
    public void verifyPage(UUID uuid) {
        pageRepository.findById(uuid).ifPresent(page -> {
            page.setIsVerified(!page.getIsVerified());
            pageRepository.save(page);
        });
    }

    @Override
    public org.springframework.data.domain.Page<Page> getAllPages(Pageable pageable) {
        return pageRepository.findAll(pageable);
    }

    public Page getPageDetail(UUID pageUuid) {
        return pageRepository.findById(pageUuid)
                .orElseThrow(() -> new RuntimeException("Page not found"));
    }

}
