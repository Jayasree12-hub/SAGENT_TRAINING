package com.example.patientmonitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.example.patientmonitoring.entity.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // Search by Patient ID
    List<Feedback> findByPatientPatientId(Long patientId);

    // Search by Doctor ID
    List<Feedback> findByDoctorDoctorId(Long doctorId);

    // Search by Consultation ID
    List<Feedback> findByConsultationConsultationId(Long consultationId);

    // Search by Rating
    List<Feedback> findByRating(Integer rating);
}