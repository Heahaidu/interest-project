package com.aws.controller;

import com.aws.pojo.PageMember;
import com.aws.services.PageMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ApiPageMemberController {

    @Autowired
    private PageMemberService pageMemberService;

    // GET: danh sách member theo page UUID
    @GetMapping("/page-members/page/{page}")
    public ResponseEntity<Page<PageMember>> getPageMembersByPage(
            @PathVariable UUID pageUuid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PageMember> members = pageMemberService.getPageMembersByPageUuid(pageUuid, page, size);
        return ResponseEntity.ok(members);
    }

    // GET: danh sách member theo user UUID
    @GetMapping("/page-members/user/{userUuid}")
    public ResponseEntity<Page<PageMember>> getPageMembersByUser(
            @PathVariable UUID userUuid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PageMember> members = pageMemberService.getPageMembersByUserUuid(userUuid, page, size);
        return ResponseEntity.ok(members);
    }

    // GET: danh sách member theo invitation status
    @GetMapping("/page-members/status/{invitationStatus}")
    public ResponseEntity<Page<PageMember>> getPageMembersByStatus(
            @PathVariable String invitationStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PageMember> members = pageMemberService.getPageMembersByInvitationStatus(invitationStatus, page, size);
        return ResponseEntity.ok(members);
    }

    // POST: tạo hoặc cập nhật member
    @PostMapping("/page-member")
    public ResponseEntity<PageMember> createOrUpdatePageMember(@RequestBody PageMember member) {
        PageMember pageMember = new PageMember();
        return ResponseEntity.ok(pageMemberService.addOrUpdatePageMember(pageMember));
    }

    // DELETE: xóa member theo UUID
    @DeleteMapping("/page-member-delete/{uuid}")
    public ResponseEntity<?> deletePageMember(@PathVariable UUID uuid) {
        PageMember pageMember = pageMemberService.findPageMemberByUuid(uuid);
        if (pageMember != null) {
            pageMemberService.deletePageMember(pageMember);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
