package com.example.patient_monitoring.service;

import com.example.patient_monitoring.entity.Doctor;
import com.example.patient_monitoring.entity.Patient;
import com.example.patient_monitoring.entity.PatientHistory;
import com.example.patient_monitoring.repository.DoctorRepository;
import com.example.patient_monitoring.repository.PatientHistoryRepository;
import com.example.patient_monitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientHistoryService {

    private final PatientHistoryRepository patientHistoryRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public PatientHistoryService(PatientHistoryRepository patientHistoryRepository,
                                 PatientRepository patientRepository,
                                 DoctorRepository doctorRepository) {
        this.patientHistoryRepository = patientHistoryRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<PatientHistory> getAllHistories() {
        return patientHistoryRepository.findAll();
    }

    public Optional<PatientHistory> getHistoryById(Integer id) {
        return patientHistoryRepository.findById(id);
    }

    public PatientHistory createHistory(Integer patientId, Integer doctorId, PatientHistory history) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id " + patientId));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id " + doctorId));

        history.setPatient(patient);
        history.setDoctor(doctor);

        return patientHistoryRepository.save(history);
    }

    public PatientHistory updateHistory(Integer id, PatientHistory updatedHistory) {
        return patientHistoryRepository.findById(id)
                .map(history -> {
                    history.setMedicalReport(updatedHistory.getMedicalReport());
                    history.setReportDate(updatedHistory.getReportDate());
                    history.setDiagnosis(updatedHistory.getDiagnosis());
                    if(updatedHistory.getPatient() != null) history.setPatient(updatedHistory.getPatient());
                    if(updatedHistory.getDoctor() != null) history.setDoctor(updatedHistory.getDoctor());
                    return patientHistoryRepository.save(history);
                }).orElseThrow(() -> new RuntimeException("PatientHistory not found with id " + id));
    }

    public void deleteHistory(Integer id) {
        patientHistoryRepository.deleteById(id);
    }
}
