package com.grocery.groceryapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    private String notificationMessage;

    private LocalDateTime notificationTime;

    // FK → CUSTOMER
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    // FK → ORDER
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;


    // Constructor
    public Notification() {
        this.notificationTime = LocalDateTime.now();
    }


    // Getters and Setters

    public Long getNotificationId() {
        return notificationId;
    }

    public String getNotificationMessage() {
        return notificationMessage;
    }

    public void setNotificationMessage(String notificationMessage) {
        this.notificationMessage = notificationMessage;
    }

    public LocalDateTime getNotificationTime() {
        return notificationTime;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }
}
