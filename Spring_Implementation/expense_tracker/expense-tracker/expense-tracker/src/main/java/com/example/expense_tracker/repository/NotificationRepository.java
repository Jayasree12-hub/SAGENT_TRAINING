package com.example.expense_tracker.repository;

//public interface NotificationRepository {
//}


import com.example.expense_tracker.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
