package com.example.patient_monitoring.service;

import com.example.patient_monitoring.entity.Patient;
import com.example.patient_monitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    // CREATE
    public Patient addPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    // READ ALL
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // READ BY ID
    public Optional<Patient> getPatientById(Integer id) {
        return patientRepository.findById(id);
    }

    // UPDATE
    public Patient updatePatient(Integer id, Patient updatedPatient) {
        return patientRepository.findById(id).map(patient -> {
            patient.setName(updatedPatient.getName());
            patient.setAge(updatedPatient.getAge());
            patient.setContactNo(updatedPatient.getContactNo());
            patient.setEmail(updatedPatient.getEmail());
            patient.setPassword(updatedPatient.getPassword());
            patient.setGender(updatedPatient.getGender());
            return patientRepository.save(patient);
        }).orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    // DELETE
    public void deletePatient(Integer id) {
        patientRepository.deleteById(id);
    }
}
