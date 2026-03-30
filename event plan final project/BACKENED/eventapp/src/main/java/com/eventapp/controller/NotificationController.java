package com.eventapp.controller;

import com.eventapp.entity.Notification;
import com.eventapp.entity.User;
import com.eventapp.service.NotificationService;
import com.eventapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public List<Notification> getAll() { return notificationService.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getById(@PathVariable Integer id) {
        return notificationService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Notification create(@RequestBody Notification notification) { return notificationService.create(notification); }

    @PutMapping("/{id}")
    public ResponseEntity<Notification> update(@PathVariable Integer id, @RequestBody Notification notification) {
        try { return ResponseEntity.ok(notificationService.update(id, notification)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getByUser(@PathVariable Integer userId) { return notificationService.getByUser(userId); }

    @GetMapping("/user/{userId}/unread")
    public List<Notification> getUnread(@PathVariable Integer userId) { return notificationService.getUnreadByUser(userId); }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public List<Notification> getMyNotifications(Authentication authentication) {
        User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationService.getByUser(user.getUserId());
    }

    @GetMapping("/me/unread")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public List<Notification> getMyUnread(Authentication authentication) {
        User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationService.getUnreadByUser(user.getUserId());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Integer id) {
        try { return ResponseEntity.ok(notificationService.markAsRead(id)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }
}
