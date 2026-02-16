package com.example.admission_system.controller;

import com.example.admission_system.entity.Student;
import com.example.admission_system.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService service;

    // ✅ Create
    @PostMapping
    public Student create(@RequestBody Student student){
        return service.save(student);
    }

    // ✅ Get All
    @GetMapping
    public List<Student> getAll(){
        return service.getAll();
    }

    // ✅ Get By Id
    @GetMapping("/{id}")
    public Student getById(@PathVariable Long id){
        return service.getById(id);
    }

    // ✅ Update
    @PutMapping("/{id}")
    public Student update(@PathVariable Long id,
                          @RequestBody Student student){
        return service.update(id, student);
    }

    // ✅ Delete
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        service.delete(id);
    }
}
