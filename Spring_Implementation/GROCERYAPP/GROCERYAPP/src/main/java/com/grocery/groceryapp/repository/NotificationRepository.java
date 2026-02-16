package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByCustomerCustomerId(Long customerId);

    List<Notification> findByOrderOrderId(Long orderId);

}
