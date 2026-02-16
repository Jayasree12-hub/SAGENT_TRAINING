package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.Customer;
import com.grocery.groceryapp.entity.Notification;
import com.grocery.groceryapp.entity.Order;
import com.grocery.groceryapp.repository.CustomerRepository;
import com.grocery.groceryapp.repository.NotificationRepository;
import com.grocery.groceryapp.repository.OrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderRepository orderRepository;


    // CREATE
    public Notification addNotification(Notification notification, Long customerId, Long orderId) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        notification.setCustomer(customer);
        notification.setOrder(order);

        return notificationRepository.save(notification);
    }


    // READ ALL
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }


    // READ BY CUSTOMER
    public List<Notification> getByCustomer(Long customerId) {
        return notificationRepository.findByCustomerCustomerId(customerId);
    }


    // DELETE
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

}
