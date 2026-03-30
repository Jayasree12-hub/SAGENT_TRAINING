package com.eventapp.entity;



import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Integer feedbackId;

    @Column(name = "event_id")
    private Integer eventId;

    @Column(name = "guest_email")
    private String guestEmail;

    private Integer rating;

    private String comments;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    public Integer getFeedbackId() { return feedbackId; }

    public void setFeedbackId(Integer feedbackId) { this.feedbackId = feedbackId; }

    public Integer getEventId() { return eventId; }

    public void setEventId(Integer eventId) { this.eventId = eventId; }

    public String getGuestEmail() { return guestEmail; }

    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }

    public Integer getRating() { return rating; }

    public void setRating(Integer rating) { this.rating = rating; }

    public String getComments() { return comments; }

    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }

    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}