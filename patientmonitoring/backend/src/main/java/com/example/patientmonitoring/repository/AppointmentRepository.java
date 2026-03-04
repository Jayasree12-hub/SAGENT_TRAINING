package com.example.patientmonitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import com.example.patientmonitoring.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Search by Doctor ID
    List<Appointment> findByDoctorDoctorId(Long doctorId);

    // Search by Patient ID
    List<Appointment> findByPatientPatientId(Long patientId);

    // Search by Date
    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);
}