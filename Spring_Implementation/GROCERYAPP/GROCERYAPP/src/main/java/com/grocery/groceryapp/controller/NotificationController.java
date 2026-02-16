package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.Notification;
import com.grocery.groceryapp.service.NotificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;


    // CREATE
    @PostMapping
    public Notification addNotification(
            @RequestBody Notification notification,
            @RequestParam Long customerId,
            @RequestParam Long orderId
    ) {
        return notificationService.addNotification(notification, customerId, orderId);
    }


    // READ ALL
    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }


    // READ BY CUSTOMER
    @GetMapping("/customer/{customerId}")
    public List<Notification> getByCustomer(@PathVariable Long customerId) {
        return notificationService.getByCustomer(customerId);
    }


    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {

        notificationService.deleteNotification(id);

        return "Notification deleted successfully";
    }

}
