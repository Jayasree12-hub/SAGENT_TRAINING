package com.example.admission_system.service;


import com.example.admission_system.entity.Officer;
import com.example.admission_system.repository.OfficerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfficerService {

    private final OfficerRepository repository;

    public Officer save(Officer officer){
        return repository.save(officer);
    }

    public List<Officer> getAll(){
        return repository.findAll();
    }

    public Officer getById(Long id){
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
    }

    public void delete(Long id){
        repository.deleteById(id);
    }
}
