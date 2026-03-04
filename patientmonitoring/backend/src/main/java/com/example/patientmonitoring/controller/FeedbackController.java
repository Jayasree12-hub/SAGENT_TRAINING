package com.example.patientmonitoring.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.patientmonitoring.entity.Feedback;
import com.example.patientmonitoring.service.FeedbackService;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // CREATE
    @PostMapping("/{patientId}/{doctorId}/{consultationId}")
    public Feedback create(@PathVariable Long patientId,
                           @PathVariable Long doctorId,
                           @PathVariable Long consultationId,
                           @RequestBody Feedback feedback) {

        return feedbackService.createFeedback(
                patientId, doctorId, consultationId, feedback);
    }

    // GET ALL
    @GetMapping
    public List<Feedback> getAll() {
        return feedbackService.getAllFeedback();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Feedback getById(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id);
    }

    // SEARCH
    @GetMapping("/patient/{patientId}")
    public List<Feedback> getByPatient(@PathVariable Long patientId) {
        return feedbackService.getByPatient(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Feedback> getByDoctor(@PathVariable Long doctorId) {
        return feedbackService.getByDoctor(doctorId);
    }

    @GetMapping("/rating/{rating}")
    public List<Feedback> getByRating(@PathVariable Integer rating) {
        return feedbackService.getByRating(rating);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Feedback update(@PathVariable Long id,
                           @RequestBody Feedback feedback) {
        return feedbackService.updateFeedback(id, feedback);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return "Feedback deleted successfully";
    }
}