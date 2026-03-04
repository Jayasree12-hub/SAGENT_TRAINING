package com.example.patientmonitoring.service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import com.example.patientmonitoring.entity.Appointment;
import com.example.patientmonitoring.entity.Doctor;
import com.example.patientmonitoring.entity.Patient;
import com.example.patientmonitoring.repository.AppointmentRepository;
import com.example.patientmonitoring.repository.DoctorRepository;
import com.example.patientmonitoring.repository.PatientRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorRepository doctorRepository,
                              PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    // CREATE
    public Appointment createAppointment(Long doctorId, Long patientId,
                                         Appointment appointment) {

        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
        Patient patient = patientRepository.findById(patientId).orElse(null);

        if (doctor != null && patient != null) {
            appointment.setDoctor(doctor);
            appointment.setPatient(patient);
            return appointmentRepository.save(appointment);
        }

        return null;
    }

    // READ ALL
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // READ BY ID
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id).orElse(null);
    }

    // SEARCH BY DOCTOR
    public List<Appointment> getByDoctorId(Long doctorId) {
        return appointmentRepository.findByDoctorDoctorId(doctorId);
    }

    // SEARCH BY PATIENT
    public List<Appointment> getByPatientId(Long patientId) {
        return appointmentRepository.findByPatientPatientId(patientId);
    }

    // SEARCH BY DATE
    public List<Appointment> getByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date);
    }

    // UPDATE
    public Appointment updateAppointment(Long id, Appointment updated) {
        Appointment existing = appointmentRepository.findById(id).orElse(null);

        if (existing != null) {
            existing.setAppointmentDate(updated.getAppointmentDate());
            existing.setAppointmentTime(updated.getAppointmentTime());
            existing.setAppointmentStatus(updated.getAppointmentStatus());
            return appointmentRepository.save(existing);
        }
        return null;
    }

    // DELETE
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
}