package com.eventapp.controller;

import com.eventapp.entity.Message;
import com.eventapp.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @GetMapping
    public List<Message> getAll() { return messageService.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Message> getById(@PathVariable Integer id) {
        return messageService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Message create(@RequestBody Message message) { return messageService.create(message); }

    @PutMapping("/{id}")
    public ResponseEntity<Message> update(@PathVariable Integer id, @RequestBody Message message) {
        try { return ResponseEntity.ok(messageService.update(id, message)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        messageService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/forum/{forumId}")
    public List<Message> getByForum(@PathVariable Integer forumId) { return messageService.getByForum(forumId); }

    @GetMapping("/sender/{senderId}")
    public List<Message> getBySender(@PathVariable Integer senderId) { return messageService.getBySender(senderId); }
}
