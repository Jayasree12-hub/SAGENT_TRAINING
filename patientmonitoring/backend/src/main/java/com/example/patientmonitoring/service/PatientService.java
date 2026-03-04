package com.example.patientmonitoring.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import com.example.patientmonitoring.entity.Patient;
import com.example.patientmonitoring.repository.PatientRepository;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    // CREATE
    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    // READ - All
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // READ - By ID
    public Patient getPatientById(Long id) {
        return patientRepository.findById(id).orElse(null);
    }

    // SEARCH - By Name
    public List<Patient> searchByName(String name) {
        return patientRepository.findByName(name);
    }

    // SEARCH - By Email
    public Optional<Patient> searchByEmail(String email) {
        return patientRepository.findByEmail(email);
    }

    // UPDATE
    public Patient updatePatient(Long id, Patient updatedPatient) {
        Patient existing = patientRepository.findById(id).orElse(null);

        if (existing != null) {
            existing.setName(updatedPatient.getName());
            existing.setAge(updatedPatient.getAge());
            existing.setContactNo(updatedPatient.getContactNo());
            existing.setEmail(updatedPatient.getEmail());
            existing.setPassword(updatedPatient.getPassword());
            existing.setGender(updatedPatient.getGender());

            return patientRepository.save(existing);
        }
        return null;
    }

    // DELETE
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}