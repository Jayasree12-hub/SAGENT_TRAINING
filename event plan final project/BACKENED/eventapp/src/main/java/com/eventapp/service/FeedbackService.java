package com.eventapp.service;



import com.eventapp.entity.Feedback;
import com.eventapp.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    // ADD EMAIL SERVICE
    private final EmailService emailService;

    public List<Feedback> getAll() {
        return feedbackRepository.findAll();
    }

    public Optional<Feedback> getById(Integer id) {
        return feedbackRepository.findById(id);
    }

    public Feedback create(Feedback feedback) {

        feedback.setSubmittedAt(LocalDateTime.now());

        return feedbackRepository.save(feedback);
    }

    public Feedback update(Integer id, Feedback updated) {

        return feedbackRepository.findById(id).map(f -> {

            f.setEventId(updated.getEventId());
            f.setGuestEmail(updated.getGuestEmail());
            f.setRating(updated.getRating());
            f.setComments(updated.getComments());

            return feedbackRepository.save(f);

        }).orElseThrow(() -> new RuntimeException("Feedback not found: " + id));
    }

    public void delete(Integer id) {
        feedbackRepository.deleteById(id);
    }

    public List<Feedback> getByEvent(Integer eventId) {
        return feedbackRepository.findByEventId(eventId);
    }

    public List<Feedback> getByGuest(String email) {
        return feedbackRepository.findByGuestEmail(email);
    }

    // SEND FEEDBACK REQUEST EMAIL
    public void sendFeedbackRequest(String guestEmail, String eventName) {

        emailService.sendFeedbackEmail(guestEmail, eventName);

    }
}
