package com.example.patient_monitoring.service;

import com.example.patient_monitoring.entity.Consultation;
import com.example.patient_monitoring.entity.Doctor;
import com.example.patient_monitoring.entity.Patient;
import com.example.patient_monitoring.repository.ConsultationRepository;
import com.example.patient_monitoring.repository.DoctorRepository;
import com.example.patient_monitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public ConsultationService(ConsultationRepository consultationRepository,
                               DoctorRepository doctorRepository,
                               PatientRepository patientRepository) {
        this.consultationRepository = consultationRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    public List<Consultation> getAllConsultations() {
        return consultationRepository.findAll();
    }

    public Optional<Consultation> getConsultationById(Integer id) {
        return consultationRepository.findById(id);
    }

    public Consultation createConsultation(Integer doctorId, Integer patientId, Consultation consultation) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id " + doctorId));
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id " + patientId));

        consultation.setDoctor(doctor);
        consultation.setPatient(patient);

        return consultationRepository.save(consultation);
    }

    public Consultation updateConsultation(Integer id, Integer doctorId, Integer patientId, Consultation updatedConsultation) {
        return consultationRepository.findById(id).map(consultation -> {
            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found with id " + doctorId));
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found with id " + patientId));

            consultation.setDoctor(doctor);
            consultation.setPatient(patient);
            consultation.setConsultationDate(updatedConsultation.getConsultationDate());
            consultation.setPrescription(updatedConsultation.getPrescription());

            return consultationRepository.save(consultation);
        }).orElseThrow(() -> new RuntimeException("Consultation not found with id " + id));
    }

    public void deleteConsultation(Integer id) {
        consultationRepository.deleteById(id);
    }
}
