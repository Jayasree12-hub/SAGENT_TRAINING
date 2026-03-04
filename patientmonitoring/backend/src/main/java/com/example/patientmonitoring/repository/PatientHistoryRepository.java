package com.example.patientmonitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import com.example.patientmonitoring.entity.PatientHistory;

public interface PatientHistoryRepository
        extends JpaRepository<PatientHistory, Long> {

    // Search by Patient ID
    List<PatientHistory> findByPatientPatientId(Long patientId);

    // Search by Doctor ID
    List<PatientHistory> findByDoctorDoctorId(Long doctorId);

    // Search by Report Date
    List<PatientHistory> findByReportDate(LocalDate reportDate);
}