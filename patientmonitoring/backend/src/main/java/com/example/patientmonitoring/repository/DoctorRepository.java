package com.example.patientmonitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import com.example.patientmonitoring.entity.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // Search by Name
    List<Doctor> findByDoctorName(String doctorName);

    // Search by Email
    Optional<Doctor> findByDoctorEmail(String doctorEmail);
}