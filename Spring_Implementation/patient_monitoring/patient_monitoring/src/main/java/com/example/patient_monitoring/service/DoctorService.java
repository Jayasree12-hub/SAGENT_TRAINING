package com.example.patient_monitoring.service;

import com.example.patient_monitoring.entity.Doctor;
import com.example.patient_monitoring.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    // CREATE
    public Doctor addDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    // READ ALL
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // READ BY ID
    public Optional<Doctor> getDoctorById(Integer id) {
        return doctorRepository.findById(id);
    }

    // UPDATE
    public Doctor updateDoctor(Integer id, Doctor updatedDoctor) {
        return doctorRepository.findById(id).map(doctor -> {
            doctor.setDoctorName(updatedDoctor.getDoctorName());
            doctor.setSpecialization(updatedDoctor.getSpecialization());
            doctor.setDoctorEmail(updatedDoctor.getDoctorEmail());
            doctor.setDoctorPassword(updatedDoctor.getDoctorPassword());
            return doctorRepository.save(doctor);
        }).orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    // DELETE
    public void deleteDoctor(Integer id) {
        doctorRepository.deleteById(id);
    }
}
