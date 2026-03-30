package com.eventapp.controller;



import com.eventapp.entity.Feedback;
import com.eventapp.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    public List<Feedback> getAll() {
        return feedbackService.getAll();
    }

    @GetMapping("/{id}")
    public Feedback getById(@PathVariable Integer id) {
        return feedbackService.getById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
    }

    @PostMapping
    public Feedback create(@RequestBody Feedback feedback) {
        return feedbackService.create(feedback);
    }

    @PutMapping("/{id}")
    public Feedback update(@PathVariable Integer id, @RequestBody Feedback feedback) {
        return feedbackService.update(id, feedback);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        feedbackService.delete(id);
    }

    @GetMapping("/event/{eventId}")
    public List<Feedback> getByEvent(@PathVariable Integer eventId) {
        return feedbackService.getByEvent(eventId);
    }

    @GetMapping("/guest")
    public List<Feedback> getByGuest(@RequestParam String email) {
        return feedbackService.getByGuest(email);
    }

    // SEND FEEDBACK EMAIL
    @PostMapping("/request")
    public String requestFeedback(@RequestParam String email,
                                  @RequestParam String eventName){

        feedbackService.sendFeedbackRequest(email, eventName);

        return "Feedback request email sent";
    }
}
