package com.example.admission_system.controller;


import com.example.admission_system.entity.Course;
import com.example.admission_system.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService service;

    @PostMapping
    public Course create(@RequestBody Course course){
        return service.save(course);
    }

    @GetMapping
    public List<Course> getAll(){
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Course getById(@PathVariable Long id){
        return service.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        service.delete(id);
    }
}
