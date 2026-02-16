package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.Payment;
import com.grocery.groceryapp.service.PaymentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;


    @PostMapping
    public Payment addPayment(
            @RequestBody Payment payment,
            @RequestParam Long orderId
    ) {
        return paymentService.addPayment(payment, orderId);
    }


    @GetMapping
    public List<Payment> getAll() {
        return paymentService.getAll();
    }
}
