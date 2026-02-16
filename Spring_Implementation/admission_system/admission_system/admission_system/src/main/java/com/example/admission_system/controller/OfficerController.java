package com.example.admission_system.controller;

import com.example.admission_system.entity.Officer;
import com.example.admission_system.service.OfficerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/officers")
@RequiredArgsConstructor
public class OfficerController {

    private final OfficerService service;

    @PostMapping
    public Officer create(@RequestBody Officer officer){
        return service.save(officer);
    }

    @GetMapping
    public List<Officer> getAll(){
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Officer getById(@PathVariable Long id){
        return service.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        service.delete(id);
    }
}
