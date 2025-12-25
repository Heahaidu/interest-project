package com.aws.controller;

import com.aws.pojo.PageFollower;
import com.aws.services.PageFollowerService;
import com.aws.services.PageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ApiPageFollowerController {

    @Autowired
    private PageFollowerService pageFollowerService;

    @Autowired
    private PageService pageService;

    // Lấy 1 follower theo ID
    @GetMapping("/page-follower/{uuid}")
    public ResponseEntity<PageFollower> getPageFollowerById(@PathVariable UUID uuid) {
        PageFollower follower = pageFollowerService.findPageFollowerById(uuid);
        return (follower != null) ? ResponseEntity.ok(follower) : ResponseEntity.notFound().build();
    }

    // Tạo hoặc cập nhật PageFollower
    @PostMapping("/page-follower-update")
    public ResponseEntity<?> addOrUpdatePageFollower(@RequestBody PageFollower pageFollower) {
        boolean isCreate = (pageFollower.getUuid() == null);
        PageFollower saved = pageFollowerService.addOrUpdatePageFollower(pageFollower);
        if (isCreate) {
            pageService.increaseFollowerCount(saved.getPageUuid());
        }
        return ResponseEntity.ok(saved);
    }

    // Xóa PageFollower
    @DeleteMapping("/page-follower-delete/{uuid}")
    public ResponseEntity<Void> deletePageFollower(@PathVariable UUID uuid) {
        PageFollower follower = pageFollowerService.findPageFollowerById(uuid);
        if (follower == null) {
            return ResponseEntity.notFound().build();
        }
        UUID pageUuid = follower.getPageUuid();
        pageFollowerService.deletePageFollower(follower);
        pageService.decreaseFollowerCount(pageUuid);
        return ResponseEntity.noContent().build();
    }

    // Lấy danh sách followers theo Page UUID
    @GetMapping("/page-followers/page/{pageUuid}")
    public ResponseEntity<Page<PageFollower>> getByPageUuid(@PathVariable UUID pageUuid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PageFollower> result = pageFollowerService.getPageFollowersByPageUuid(pageUuid, page, size);
        return ResponseEntity.ok(result);
    }

    // Lấy danh sách pages mà 1 user đang follow
    @GetMapping("/page-followers/user/{userUuid}")
    public ResponseEntity<Page<PageFollower>> getByUserUuid(@PathVariable UUID userUuid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PageFollower> result = pageFollowerService.getPageFollowersByFollowerUuid(userUuid, page, size);
        return ResponseEntity.ok(result);
    }
}
