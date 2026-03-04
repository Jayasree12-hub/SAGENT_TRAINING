package com.example.patientmonitoring.service;

import org.springframework.stereotype.Service;
import java.util.List;
import com.example.patientmonitoring.entity.*;
import com.example.patientmonitoring.repository.*;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final ConsultationRepository consultationRepository;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           PatientRepository patientRepository,
                           DoctorRepository doctorRepository,
                           ConsultationRepository consultationRepository) {
        this.feedbackRepository = feedbackRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.consultationRepository = consultationRepository;
    }

    // CREATE
    public Feedback createFeedback(Long patientId,
                                   Long doctorId,
                                   Long consultationId,
                                   Feedback feedback) {

        Patient patient = patientRepository.findById(patientId).orElse(null);
        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
        Consultation consultation = consultationRepository.findById(consultationId).orElse(null);

        if (patient != null && doctor != null && consultation != null) {
            feedback.setPatient(patient);
            feedback.setDoctor(doctor);
            feedback.setConsultation(consultation);
            return feedbackRepository.save(feedback);
        }

        return null;
    }

    // READ ALL
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    // READ BY ID
    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id).orElse(null);
    }

    // SEARCH
    public List<Feedback> getByPatient(Long patientId) {
        return feedbackRepository.findByPatientPatientId(patientId);
    }

    public List<Feedback> getByDoctor(Long doctorId) {
        return feedbackRepository.findByDoctorDoctorId(doctorId);
    }

    public List<Feedback> getByConsultation(Long consultationId) {
        return feedbackRepository.findByConsultationConsultationId(consultationId);
    }

    public List<Feedback> getByRating(Integer rating) {
        return feedbackRepository.findByRating(rating);
    }

    // UPDATE
    public Feedback updateFeedback(Long id, Feedback updated) {
        Feedback existing = feedbackRepository.findById(id).orElse(null);

        if (existing != null) {
            existing.setRating(updated.getRating());
            existing.setComments(updated.getComments());
            existing.setFeedbackDate(updated.getFeedbackDate());
            return feedbackRepository.save(existing);
        }

        return null;
    }

    // DELETE
    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }
}