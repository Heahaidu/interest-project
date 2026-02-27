package com.aws.controller;

import com.aws.pojo.Account;
import com.aws.pojo.Page;
import com.aws.services.AccountService;
import com.aws.services.PageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user")
public class ApiPageController {

    @Autowired
    private PageService pageService;

    @Autowired
    private AccountService accountService;

    @GetMapping("/pages/owner")
    public ResponseEntity<org.springframework.data.domain.Page<Page>> getPagesByOwner(
            @RequestHeader("X-User-Email") String mail,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        org.springframework.data.domain.Page<Page> pages = pageService.getPagesByOwner(accountService.getAccountByEmail(mail).getUuid(), page, size);
        return ResponseEntity.ok(pages);
    }

    @GetMapping("/page-detail/{Uuid}")
    public ResponseEntity<Page> getPageDetail(@PathVariable UUID Uuid) {
        Page page = pageService.getPageDetail(Uuid);
        return ResponseEntity.ok(page);
    }

    private String toSlug(String input) {
        return input
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }

    @PostMapping("/page-update")
    public ResponseEntity<Page> createOrUpdatePage(
            @RequestHeader("X-User-Email") String mail,
            @RequestBody Page page) {
        Account owner = accountService.getAccountByEmail(mail);
        if (page.getSlug() == null || page.getSlug().isEmpty()) {
            page.setSlug(toSlug(page.getName()));
        }

        page.setOwnerUuid(owner.getUuid());

        return ResponseEntity.ok(pageService.addOrUpdatePage(page));
    }


    @DeleteMapping("/page-delete/{uuid}")
    public ResponseEntity<?> deletePage(@PathVariable UUID uuid) {
        Page page = pageService.getPageByUuid(uuid);
        if (page != null) {
            pageService.deletePage(page);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/pages")
    public ResponseEntity<org.springframework.data.domain.Page<Page>> getAllPages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Sắp xếp theo updatedAt giảm dần
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        org.springframework.data.domain.Page<Page> pages = pageService.getAllPages(pageable);
        return ResponseEntity.ok(pages);
    }

}
