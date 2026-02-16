package com.grocery.groceryapp.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;


    private LocalDate orderDate;

    private String orderStatus;

    private String deliveryAddress;


    // CUSTOMER FK

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;


    // STORE FK

    @ManyToOne
    @JoinColumn(name = "store_id")
    private Store store;


    // DELIVERY PERSON FK

    @ManyToOne
    @JoinColumn(name = "delivery_id")
    private DeliveryPerson deliveryPerson;



    // Getters and Setters


    public Long getOrderId() {
        return orderId;
    }


    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }


    public LocalDate getOrderDate() {
        return orderDate;
    }


    public void setOrderDate(LocalDate orderDate) {
        this.orderDate = orderDate;
    }


    public String getOrderStatus() {
        return orderStatus;
    }


    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }


    public String getDeliveryAddress() {
        return deliveryAddress;
    }


    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }


    public Customer getCustomer() {
        return customer;
    }


    public void setCustomer(Customer customer) {
        this.customer = customer;
    }


    public Store getStore() {
        return store;
    }


    public void setStore(Store store) {
        this.store = store;
    }


    public DeliveryPerson getDeliveryPerson() {
        return deliveryPerson;
    }


    public void setDeliveryPerson(DeliveryPerson deliveryPerson) {
        this.deliveryPerson = deliveryPerson;
    }

}
