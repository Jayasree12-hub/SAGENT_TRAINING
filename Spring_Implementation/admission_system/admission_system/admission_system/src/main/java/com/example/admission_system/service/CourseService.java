package com.example.admission_system.service;

import com.example.admission_system.entity.Course;
import com.example.admission_system.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository repository;

    public Course save(Course course){
        return repository.save(course);
    }

    public List<Course> getAll(){
        return repository.findAll();
    }

    public Course getById(Long id){
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public void delete(Long id){
        repository.deleteById(id);
    }
}
