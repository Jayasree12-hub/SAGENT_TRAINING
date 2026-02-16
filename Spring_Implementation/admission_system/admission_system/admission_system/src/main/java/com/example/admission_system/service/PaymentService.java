package com.example.admission_system.service;


import com.example.admission_system.entity.Payment;
import com.example.admission_system.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository repository;

    public Payment save(Payment payment){
        return repository.save(payment);
    }

    public List<Payment> getAll(){
        return repository.findAll();
    }

    public Payment getById(Long id){
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public void delete(Long id){
        repository.deleteById(id);
    }
}

