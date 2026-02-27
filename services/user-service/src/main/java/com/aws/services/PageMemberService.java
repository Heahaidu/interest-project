package com.aws.services;

import com.aws.pojo.PageMember;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface PageMemberService {
    PageMember addOrUpdatePageMember(PageMember member);
    void deletePageMember(PageMember pageMember);
    PageMember findPageMemberByUuid(UUID uuid);
    Page<PageMember> getPageMembersByPageUuid(UUID pageUuid, int page, int size);
    Page<PageMember> getPageMembersByUserUuid(UUID userUuid, int page, int size);
    Page<PageMember> getPageMembersByInvitationStatus(String invitationStatus, int page, int size);
}
