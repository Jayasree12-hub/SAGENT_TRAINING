package com.eventapp.entity;



import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rsvp")
public class Rsvp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rsvp_id")
    private Integer rsvpId;

    @Column(name = "event_id")
    private Integer eventId;

    @Column(name = "guest_email")
    private String guestEmail;

    private String response;

    @Column(name = "response_time")
    private LocalDateTime responseTime;

    public Integer getRsvpId() { return rsvpId; }

    public void setRsvpId(Integer rsvpId) { this.rsvpId = rsvpId; }

    public Integer getEventId() { return eventId; }

    public void setEventId(Integer eventId) { this.eventId = eventId; }

    public String getGuestEmail() { return guestEmail; }

    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }

    public String getResponse() { return response; }

    public void setResponse(String response) { this.response = response; }

    public LocalDateTime getResponseTime() { return responseTime; }

    public void setResponseTime(LocalDateTime responseTime) { this.responseTime = responseTime; }
}
