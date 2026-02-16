package com.example.admission_system.service;

import com.example.admission_system.entity.Application;
import com.example.admission_system.entity.Course;
import com.example.admission_system.entity.Officer;
import com.example.admission_system.entity.Student;
import com.example.admission_system.repository.ApplicationRepository;
import com.example.admission_system.repository.CourseRepository;
import com.example.admission_system.repository.OfficerRepository;
import com.example.admission_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository repository;
    private final StudentRepository studentRepo;
    private final CourseRepository courseRepo;
    private final OfficerRepository officerRepo;

    // ✅ CREATE APPLICATION
    public Application create(Long stdId, Long cId, Long officerId){

        Student student = studentRepo.findById(stdId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepo.findById(cId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Officer officer = officerRepo.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        Application application = Application.builder()
                .student(student)
                .course(course)
                .officer(officer)
                .aDate(LocalDate.now())
                .aStatus("Pending")
                .build();

        return repository.save(application);
    }

    // ✅ GET ALL APPLICATIONS
    public List<Application> getAll(){
        return repository.findAll();
    }

    // ✅ GET BY ID
    public Application getById(Long id){
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    // ✅ UPDATE STATUS (Officer Approves / Rejects)
    public Application updateStatus(Long id, String status){

        Application application = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setAStatus(status);

        return repository.save(application);
    }

    // ✅ DELETE APPLICATION
    public void delete(Long id){
        repository.deleteById(id);
    }
}
