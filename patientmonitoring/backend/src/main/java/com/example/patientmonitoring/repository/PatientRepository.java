package com.example.patientmonitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import com.example.patientmonitoring.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    // Search by nam
    List<Patient> findByName(String name);

    // Search by email
    Optional<Patient> findByEmail(String email);
}