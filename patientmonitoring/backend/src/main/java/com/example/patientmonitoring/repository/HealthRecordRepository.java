package com.example.patientmonitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import com.example.patientmonitoring.entity.HealthRecord;

public interface HealthRecordRepository
        extends JpaRepository<HealthRecord, Long> {

    // Search by Patient ID
    List<HealthRecord> findByPatientPatientId(Long patientId);

    // Search by Record Date
    List<HealthRecord> findByRecordDate(LocalDate recordDate);
}