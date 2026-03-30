package com.eventapp.service;

import com.eventapp.entity.Notification;
import com.eventapp.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public List<Notification> getAll() { return notificationRepository.findAll(); }

    public Optional<Notification> getById(Integer id) { return notificationRepository.findById(id); }

    public Notification create(Notification notification) { return notificationRepository.save(notification); }

    public Notification update(Integer id, Notification updated) {
        return notificationRepository.findById(id).map(n -> {
            n.setUser(updated.getUser());
            n.setMessage(updated.getMessage());
            n.setType(updated.getType());
            n.setIsRead(updated.getIsRead());
            n.setCreatedAt(updated.getCreatedAt());
            return notificationRepository.save(n);
        }).orElseThrow(() -> new RuntimeException("Notification not found: " + id));
    }

    public void delete(Integer id) { notificationRepository.deleteById(id); }

    public List<Notification> getByUser(Integer userId) { return notificationRepository.findByUser_UserId(userId); }

    public List<Notification> getUnreadByUser(Integer userId) {
        return notificationRepository.findByUser_UserIdAndIsRead(userId, false);
    }

    public Notification markAsRead(Integer id) {
        return notificationRepository.findById(id).map(n -> {
            n.setIsRead(true);
            return notificationRepository.save(n);
        }).orElseThrow(() -> new RuntimeException("Notification not found: " + id));
    }
}
