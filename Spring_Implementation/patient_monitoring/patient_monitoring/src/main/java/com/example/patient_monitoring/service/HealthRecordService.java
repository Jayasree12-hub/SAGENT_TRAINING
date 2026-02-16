package com.example.patient_monitoring.service;

import com.example.patient_monitoring.entity.HealthRecord;
import com.example.patient_monitoring.entity.Patient;
import com.example.patient_monitoring.repository.HealthRecordRepository;
import com.example.patient_monitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HealthRecordService {

    private final HealthRecordRepository healthRecordRepository;
    private final PatientRepository patientRepository;

    public HealthRecordService(HealthRecordRepository healthRecordRepository, PatientRepository patientRepository) {
        this.healthRecordRepository = healthRecordRepository;
        this.patientRepository = patientRepository;
    }

    public List<HealthRecord> getAllHealthRecords() {
        return healthRecordRepository.findAll();
    }

    public Optional<HealthRecord> getHealthRecordById(Integer id) {
        return healthRecordRepository.findById(id);
    }

    public HealthRecord createHealthRecord(Integer patientId, HealthRecord healthRecord) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id " + patientId));
        healthRecord.setPatient(patient);
        return healthRecordRepository.save(healthRecord);
    }

    public HealthRecord updateHealthRecord(Integer id, HealthRecord updatedRecord) {
        return healthRecordRepository.findById(id)
                .map(record -> {
                    record.setHeartrate(updatedRecord.getHeartrate());
                    record.setBp(updatedRecord.getBp());
                    record.setTemperature(updatedRecord.getTemperature());
                    record.setOxygenLevel(updatedRecord.getOxygenLevel());
                    record.setRecordDate(updatedRecord.getRecordDate());
                    // Optional: update patient if needed
                    return healthRecordRepository.save(record);
                }).orElseThrow(() -> new RuntimeException("HealthRecord not found with id " + id));
    }

    public void deleteHealthRecord(Integer id) {
        healthRecordRepository.deleteById(id);
    }
}
