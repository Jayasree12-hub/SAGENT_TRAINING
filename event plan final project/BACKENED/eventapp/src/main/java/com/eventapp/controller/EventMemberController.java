package com.eventapp.controller;

import com.eventapp.entity.EventMember;
import com.eventapp.service.EventMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/event-members")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EventMemberController {
    private final EventMemberService eventMemberService;

    @GetMapping
    public List<EventMember> getAll() { return eventMemberService.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<EventMember> getById(@PathVariable Integer id) {
        return eventMemberService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public EventMember create(@RequestBody EventMember em) { return eventMemberService.create(em); }

    @PutMapping("/{id}")
    public ResponseEntity<EventMember> update(@PathVariable Integer id, @RequestBody EventMember em) {
        try { return ResponseEntity.ok(eventMemberService.update(id, em)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        eventMemberService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/event/{eventId}")
    public List<EventMember> getByEvent(@PathVariable Integer eventId) { return eventMemberService.getByEvent(eventId); }

    @GetMapping("/user/{userId}")
    public List<EventMember> getByUser(@PathVariable Integer userId) { return eventMemberService.getByUser(userId); }

    @GetMapping("/status/{status}")
    public List<EventMember> getByStatus(@PathVariable String status) { return eventMemberService.getByStatus(status); }
}
