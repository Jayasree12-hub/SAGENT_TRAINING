package com.eventapp.repository;
import com.eventapp.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUser_UserId(Integer userId);
    List<Notification> findByUser_UserIdAndIsRead(Integer userId, Boolean isRead);
}
