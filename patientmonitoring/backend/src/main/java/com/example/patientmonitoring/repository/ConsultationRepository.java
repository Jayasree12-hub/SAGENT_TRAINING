package com.example.patientmonitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import com.example.patientmonitoring.entity.Consultation;

public interface ConsultationRepository
        extends JpaRepository<Consultation, Long> {

    // Search by Patient ID
    List<Consultation> findByPatientPatientId(Long patientId);

    // Search by Doctor ID
    List<Consultation> findByDoctorDoctorId(Long doctorId);

    // Search by Appointment ID
    List<Consultation> findByAppointmentAppointmentId(Long appointmentId);

    // Search by Date
    List<Consultation> findByConsultationDate(LocalDate consultationDate);
}