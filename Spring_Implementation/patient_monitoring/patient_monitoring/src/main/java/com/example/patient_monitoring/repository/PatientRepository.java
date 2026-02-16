package com.example.patient_monitoring.repository;

import com.example.patient_monitoring.entity.Patient;  // ✅ ADD THIS
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Integer> {
}