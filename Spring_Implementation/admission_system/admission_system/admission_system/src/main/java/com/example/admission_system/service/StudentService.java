package com.example.admission_system.service;

import com.example.admission_system.entity.Student;
import com.example.admission_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository repository;

    // ✅ Create / Save Student
    public Student save(Student student){
        return repository.save(student);
    }

    // ✅ Get All Students
    public List<Student> getAll(){
        return repository.findAll();
    }

    // ✅ Get Student By Id
    public Student getById(Long id){
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    // ✅ Delete Student
    public void delete(Long id){
        repository.deleteById(id);
    }

    // ✅ Update Student
    public Student update(Long id, Student updatedStudent){
        Student student = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setName(updatedStudent.getName());
        student.setEmail(updatedStudent.getEmail());
        student.setPassword(updatedStudent.getPassword());
        student.setContactNo(updatedStudent.getContactNo());
        student.setDob(updatedStudent.getDob());
        student.setAddress(updatedStudent.getAddress());

        return repository.save(student);
    }
}
