package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.Order;
import com.grocery.groceryapp.entity.Payment;
import com.grocery.groceryapp.repository.OrderRepository;
import com.grocery.groceryapp.repository.PaymentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    public Payment addPayment(Payment payment, Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        payment.setOrder(order);

        return paymentRepository.save(payment);
    }

    public List<Payment> getAll() {
        return paymentRepository.findAll();
    }
}
