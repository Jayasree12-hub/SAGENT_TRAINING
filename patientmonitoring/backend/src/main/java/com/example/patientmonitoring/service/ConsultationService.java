package com.example.patientmonitoring.service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import com.example.patientmonitoring.entity.*;
import com.example.patientmonitoring.repository.*;

@Service
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public ConsultationService(ConsultationRepository consultationRepository,
                               PatientRepository patientRepository,
                               DoctorRepository doctorRepository,
                               AppointmentRepository appointmentRepository) {
        this.consultationRepository = consultationRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // CREATE
    public Consultation createConsultation(Long patientId,
                                           Long doctorId,
                                           Long appointmentId,
                                           Consultation consultation) {

        Patient patient = patientRepository.findById(patientId).orElse(null);
        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
        Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);

        if (patient != null && doctor != null && appointment != null) {
            consultation.setPatient(patient);
            consultation.setDoctor(doctor);
            consultation.setAppointment(appointment);
            return consultationRepository.save(consultation);
        }

        return null;
    }

    // READ ALL
    public List<Consultation> getAllConsultations() {
        return consultationRepository.findAll();
    }

    // READ BY ID
    public Consultation getConsultationById(Long id) {
        return consultationRepository.findById(id).orElse(null);
    }

    // SEARCH BY PATIENT
    public List<Consultation> getByPatientId(Long patientId) {
        return consultationRepository.findByPatientPatientId(patientId);
    }

    // SEARCH BY DOCTOR
    public List<Consultation> getByDoctorId(Long doctorId) {
        return consultationRepository.findByDoctorDoctorId(doctorId);
    }

    // SEARCH BY APPOINTMENT
    public List<Consultation> getByAppointmentId(Long appointmentId) {
        return consultationRepository.findByAppointmentAppointmentId(appointmentId);
    }

    // SEARCH BY DATE
    public List<Consultation> getByDate(LocalDate date) {
        return consultationRepository.findByConsultationDate(date);
    }

    // UPDATE
    public Consultation updateConsultation(Long id, Consultation updated) {

        Consultation existing = consultationRepository.findById(id).orElse(null);

        if (existing != null) {
            existing.setConsultationDate(updated.getConsultationDate());
            existing.setSymptoms(updated.getSymptoms());
            existing.setPrescription(updated.getPrescription());
            existing.setNotes(updated.getNotes());
            return consultationRepository.save(existing);
        }

        return null;
    }

    // DELETE
    public void deleteConsultation(Long id) {
        consultationRepository.deleteById(id);
    }
}