package com.eventapp.controller;

import com.eventapp.entity.DirectMessage;
import com.eventapp.service.DirectMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/direct-messages")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DirectMessageController {
    private final DirectMessageService directMessageService;

    @GetMapping
    public List<DirectMessage> getAll() { return directMessageService.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<DirectMessage> getById(@PathVariable Integer id) {
        return directMessageService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DirectMessage create(@RequestBody DirectMessage dm) { return directMessageService.create(dm); }

    @PutMapping("/{id}")
    public ResponseEntity<DirectMessage> update(@PathVariable Integer id, @RequestBody DirectMessage dm) {
        try { return ResponseEntity.ok(directMessageService.update(id, dm)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        directMessageService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/event/{eventId}")
    public List<DirectMessage> getByEvent(@PathVariable Integer eventId) { return directMessageService.getByEvent(eventId); }

    @GetMapping("/conversation")
    public List<DirectMessage> getConversation(@RequestParam Integer senderId, @RequestParam Integer receiverId) {
        return directMessageService.getConversation(senderId, receiverId);
    }
}
