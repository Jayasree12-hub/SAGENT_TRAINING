package com.eventapp.controller;

import com.eventapp.entity.GroupForum;
import com.eventapp.service.GroupForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/group-forums")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GroupForumController {
    private final GroupForumService groupForumService;

    @GetMapping
    public List<GroupForum> getAll() { return groupForumService.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<GroupForum> getById(@PathVariable Integer id) {
        return groupForumService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public GroupForum create(@RequestBody GroupForum gf) { return groupForumService.create(gf); }

    @PutMapping("/{id}")
    public ResponseEntity<GroupForum> update(@PathVariable Integer id, @RequestBody GroupForum gf) {
        try { return ResponseEntity.ok(groupForumService.update(id, gf)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        groupForumService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/group/{groupId}")
    public List<GroupForum> getByGroup(@PathVariable Integer groupId) { return groupForumService.getByGroup(groupId); }
}
