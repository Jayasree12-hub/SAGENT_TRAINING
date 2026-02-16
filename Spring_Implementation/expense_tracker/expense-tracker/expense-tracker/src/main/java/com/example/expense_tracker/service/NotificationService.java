package com.example.expense_tracker.service;

//public class NotificationService {
//}
//
//import com.example.expense_tracker.entity.Notification;
//import com.example.expense_tracker.repository.NotificationRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class NotificationService {
//
//    private final NotificationRepository repository;
//
//    public Notification sendNotification(Notification notification){
//        notification.setSentDate(LocalDateTime.now());
//        return repository.save(notification);
//    }
//
//    public List<Notification> getNotifications(){
//        return repository.findAll();
//    }
//}


import com.example.expense_tracker.entity.Notification;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.NotificationRepository;
import com.example.expense_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Create notification for a user
    public Notification createNotification(Long userId, Notification notification) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        notification.setUser(user);
        return notificationRepository.save(notification);
    }

    // Get all notifications
    public List<Notification> getNotifications() {
        return notificationRepository.findAll();
    }

    // Delete notification by ID
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notificationRepository.delete(notification);
    }

    public Notification updateNotification(Long notificationId, Notification updatedNotification) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setMessage(updatedNotification.getMessage());

        return notificationRepository.save(notification);
    }

}