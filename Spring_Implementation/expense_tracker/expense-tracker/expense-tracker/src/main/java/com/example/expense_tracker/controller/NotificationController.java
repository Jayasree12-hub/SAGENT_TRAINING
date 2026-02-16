//package com.example.expense_tracker.controller;
//
////public class NotificationController {
////}
//
//
//import com.example.expense_tracker.entity.Expense;
//import com.example.expense_tracker.entity.Notification;
//import com.example.expense_tracker.repository.ExpenseRepository;
//import com.example.expense_tracker.service.NotificationService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/notifications")
//@RequiredArgsConstructor
//public class NotificationController {
//
//    private final NotificationService service;
//
//    @PostMapping
//    public Notification send(@RequestBody Notification notification) {
//        return service.sendNotification(notification);
//    }
//
//    @GetMapping
//    public List<Notification> getAll() {
//        return service.getNotifications();
//    }
//}



package com.example.expense_tracker.controller;

import com.example.expense_tracker.entity.Notification;
import com.example.expense_tracker.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    @PostMapping("/user/{userId}")
    public Notification createNotification(@PathVariable Long userId, @RequestBody Notification notification){
        return service.createNotification(userId, notification);
    }

    @GetMapping
    public List<Notification> getNotifications(){
        return service.getNotifications();
    }

    @DeleteMapping("/{notificationId}")
    public String deleteNotification(@PathVariable Long notificationId){
        service.deleteNotification(notificationId);
        return "Notification deleted successfully";
    }

    @PutMapping("/{notificationId}")
    public Notification updateNotification(@PathVariable Long notificationId,
                                           @RequestBody Notification notification){
        return service.updateNotification(notificationId, notification);
    }

}