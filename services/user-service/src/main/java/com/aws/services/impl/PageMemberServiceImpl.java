package com.aws.services.impl;

import com.aws.pojo.PageMember;
import com.aws.repositories.PageMemberRepository;
import com.aws.services.PageMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PageMemberServiceImpl implements PageMemberService {

    @Autowired
    private PageMemberRepository pageMemberRepository;

    @Override
    public PageMember addOrUpdatePageMember(PageMember pageMember) {
        return this.pageMemberRepository.save(pageMember);
    }

    @Override
    public void deletePageMember(PageMember pageMember) {

        this.pageMemberRepository.delete(pageMember);
    }

    @Override
    public PageMember findPageMemberByUuid(UUID uuid) {
        return pageMemberRepository.findById(uuid).orElse(null);
    }

    @Override
    public Page<PageMember> getPageMembersByPageUuid(UUID pageUuid, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return pageMemberRepository.findByPageUuid(pageUuid, pageable);
    }

    @Override
    public Page<PageMember> getPageMembersByUserUuid(UUID userUuid, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return pageMemberRepository.findByUserUuid(userUuid, pageable);
    }

    @Override
    public Page<PageMember> getPageMembersByInvitationStatus(String invitationStatus, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return pageMemberRepository.findByInvitationStatus(invitationStatus, pageable);
    }
}
