package com.aws.services.impl;

import com.aws.pojo.PageFollower;
import com.aws.repositories.PageFollowerRepository;
import com.aws.services.PageFollowerService;
import com.aws.services.PageService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class PageFollowerServiceImpl implements PageFollowerService {

    @Autowired
    private PageFollowerRepository pageFollowerRepository;

    @Override
    public PageFollower findPageFollowerById(UUID uuid) {
        Optional<PageFollower> pageFollower = this.pageFollowerRepository.findById(uuid);
        return pageFollower.orElse(null);
    }

    @Transactional
    @Override
    public PageFollower addOrUpdatePageFollower(PageFollower pageFollower) {
        return this.pageFollowerRepository.save(pageFollower);
    }

    @Override
    public void deletePageFollower(PageFollower pageFollower) {
        this.pageFollowerRepository.delete(pageFollower);
    }

    @Override
    public Page<PageFollower> getPageFollowersByPageUuid(UUID channelUuid, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return pageFollowerRepository.findByPageUuid(channelUuid, pageable);
    }

    @Override
    public Page<PageFollower> getPageFollowersByFollowerUuid(UUID followerlUuid, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return pageFollowerRepository.findByFollowerUuid(followerlUuid, pageable);
    }
}
