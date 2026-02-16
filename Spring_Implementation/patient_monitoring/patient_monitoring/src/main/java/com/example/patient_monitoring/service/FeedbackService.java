package com.example.patient_monitoring.service;

import com.example.patient_monitoring.entity.Feedback;
import com.example.patient_monitoring.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    public Optional<Feedback> getFeedbackById(Integer id) {
        return feedbackRepository.findById(id);
    }

    public Feedback createFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }

    public Feedback updateFeedback(Integer id, Feedback updatedFeedback) {
        return feedbackRepository.findById(id)
                .map(feedback -> {
                    feedback.setConsultation(updatedFeedback.getConsultation());
                    feedback.setFeedbackDate(updatedFeedback.getFeedbackDate());
                    feedback.setMsg(updatedFeedback.getMsg());
                    return feedbackRepository.save(feedback);
                }).orElseThrow(() -> new RuntimeException("Feedback not found with id " + id));
    }

    public void deleteFeedback(Integer id) {
        feedbackRepository.deleteById(id);
    }
}
