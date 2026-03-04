package com.example.patientmonitoring.service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import com.example.patientmonitoring.entity.PatientHistory;
import com.example.patientmonitoring.entity.Patient;
import com.example.patientmonitoring.entity.Doctor;
import com.example.patientmonitoring.repository.PatientHistoryRepository;
import com.example.patientmonitoring.repository.PatientRepository;
import com.example.patientmonitoring.repository.DoctorRepository;

@Service
public class PatientHistoryService {

    private final PatientHistoryRepository historyRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public PatientHistoryService(PatientHistoryRepository historyRepository,
                                 PatientRepository patientRepository,
                                 DoctorRepository doctorRepository) {
        this.historyRepository = historyRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    // CREATE
    public PatientHistory createHistory(Long patientId, Long doctorId,
                                        PatientHistory history) {

        Patient patient = patientRepository.findById(patientId).orElse(null);
        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);

        if (patient != null && doctor != null) {
            history.setPatient(patient);
            history.setDoctor(doctor);
            return historyRepository.save(history);
        }

        return null;
    }

    // READ ALL
    public List<PatientHistory> getAllHistory() {
        return historyRepository.findAll();
    }

    // READ BY ID
    public PatientHistory getHistoryById(Long id) {
        return historyRepository.findById(id).orElse(null);
    }

    // SEARCH BY PATIENT
    public List<PatientHistory> getByPatientId(Long patientId) {
        return historyRepository.findByPatientPatientId(patientId);
    }

    // SEARCH BY DOCTOR
    public List<PatientHistory> getByDoctorId(Long doctorId) {
        return historyRepository.findByDoctorDoctorId(doctorId);
    }

    // SEARCH BY DATE
    public List<PatientHistory> getByDate(LocalDate date) {
        return historyRepository.findByReportDate(date);
    }

    // UPDATE
    public PatientHistory updateHistory(Long id, PatientHistory updated) {
        PatientHistory existing = historyRepository.findById(id).orElse(null);

        if (existing != null) {
            existing.setMedicalReport(updated.getMedicalReport());
            existing.setReportDate(updated.getReportDate());
            existing.setDiagnosis(updated.getDiagnosis());
            return historyRepository.save(existing);
        }
        return null;
    }

    // DELETE
    public void deleteHistory(Long id) {
        historyRepository.deleteById(id);
    }
}