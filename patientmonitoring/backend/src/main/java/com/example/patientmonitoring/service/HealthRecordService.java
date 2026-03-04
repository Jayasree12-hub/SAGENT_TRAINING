package com.example.patientmonitoring.service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import com.example.patientmonitoring.entity.HealthRecord;
import com.example.patientmonitoring.entity.Patient;
import com.example.patientmonitoring.repository.HealthRecordRepository;
import com.example.patientmonitoring.repository.PatientRepository;

@Service
public class HealthRecordService {

    private final HealthRecordRepository recordRepository;
    private final PatientRepository patientRepository;

    public HealthRecordService(HealthRecordRepository recordRepository,
                               PatientRepository patientRepository) {
        this.recordRepository = recordRepository;
        this.patientRepository = patientRepository;
    }

    // CREATE
    public HealthRecord createRecord(Long patientId,
                                     HealthRecord record) {

        Patient patient = patientRepository.findById(patientId).orElse(null);

        if (patient != null) {
            record.setPatient(patient);
            return recordRepository.save(record);
        }

        return null;
    }

    // READ ALL
    public List<HealthRecord> getAllRecords() {
        return recordRepository.findAll();
    }

    // READ BY ID
    public HealthRecord getRecordById(Long id) {
        return recordRepository.findById(id).orElse(null);
    }

    // SEARCH BY PATIENT
    public List<HealthRecord> getByPatientId(Long patientId) {
        return recordRepository.findByPatientPatientId(patientId);
    }

    // SEARCH BY DATE
    public List<HealthRecord> getByDate(LocalDate date) {
        return recordRepository.findByRecordDate(date);
    }

    // UPDATE
    public HealthRecord updateRecord(Long id, HealthRecord updated) {

        HealthRecord existing = recordRepository.findById(id).orElse(null);

        if (existing != null) {
            existing.setRecordDate(updated.getRecordDate());
            existing.setHeartRate(updated.getHeartRate());
            existing.setBloodPressure(updated.getBloodPressure());
            existing.setTemperature(updated.getTemperature());
            existing.setOxygenLevel(updated.getOxygenLevel());

            return recordRepository.save(existing);
        }

        return null;
    }

    // DELETE
    public void deleteRecord(Long id) {
        recordRepository.deleteById(id);
    }
}