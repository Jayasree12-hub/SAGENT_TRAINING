package com.example.patientmonitoring.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import com.example.patientmonitoring.entity.Doctor;
import com.example.patientmonitoring.repository.DoctorRepository;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    // CREATE
    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    // READ - All
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // READ - By ID
    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id).orElse(null);
    }

    // SEARCH - By Name
    public List<Doctor> searchByName(String name) {
        return doctorRepository.findByDoctorName(name);
    }

    // SEARCH - By Email
    public Optional<Doctor> searchByEmail(String email) {
        return doctorRepository.findByDoctorEmail(email);
    }

    // UPDATE
    public Doctor updateDoctor(Long id, Doctor updatedDoctor) {
        Doctor existing = doctorRepository.findById(id).orElse(null);

        if (existing != null) {
            existing.setDoctorName(updatedDoctor.getDoctorName());
            existing.setSpecialization(updatedDoctor.getSpecialization());
            existing.setDoctorEmail(updatedDoctor.getDoctorEmail());
            existing.setDoctorPassword(updatedDoctor.getDoctorPassword());

            return doctorRepository.save(existing);
        }
        return null;
    }

    // DELETE
    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }
}