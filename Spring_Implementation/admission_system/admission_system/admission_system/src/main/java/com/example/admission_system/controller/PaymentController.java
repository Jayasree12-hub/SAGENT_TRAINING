package com.example.admission_system.controller;

import com.example.admission_system.entity.Payment;
import com.example.admission_system.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService service;

    @PostMapping
    public Payment create(@RequestBody Payment payment){
        return service.save(payment);
    }

    @GetMapping
    public List<Payment> getAll(){
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Payment getById(@PathVariable Long id){
        return service.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        service.delete(id);
    }
}
