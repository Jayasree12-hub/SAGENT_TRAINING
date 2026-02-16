package com.example.admission_system.controller;


import com.example.admission_system.entity.Application;
import com.example.admission_system.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService service;

    // Create Application using studentId, courseId, officerId
    @PostMapping("/{stdId}/{cId}/{officerId}")
    public Application create(@PathVariable Long stdId,
                              @PathVariable Long cId,
                              @PathVariable Long officerId){
        return service.create(stdId, cId, officerId);
    }

    @GetMapping
    public List<Application> getAll(){
        return service.getAll();
    }

    // ✅ Update Status
    @PutMapping("/{id}/status")
    public Application updateStatus(@PathVariable Long id,
                                    @RequestParam String status){
        return service.updateStatus(id, status);
    }
}
