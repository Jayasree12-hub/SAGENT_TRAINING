package com.eventapp.controller;

import com.eventapp.entity.Rsvp;
import com.eventapp.service.RsvpService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/rsvp")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RsvpController {

    private final RsvpService rsvpService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @GetMapping
    public List<Rsvp> getAll() {
        return rsvpService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rsvp> getById(@PathVariable Integer id) {
        return rsvpService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/event/{eventId}")
    public List<Rsvp> getByEvent(@PathVariable Integer eventId) {
        return rsvpService.getByEvent(eventId);
    }

    @GetMapping("/guest")
    public List<Rsvp> getByGuest(@RequestParam String email) {
        return rsvpService.getByGuest(email);
    }

    @GetMapping("/respond")
    public ResponseEntity<Void> respond(@RequestParam(required = false) String eventId,
                                        @RequestParam(required = false) String email,
                                        @RequestParam(required = false) String response) {
        try {
            Integer parsedEventId = parseEventId(eventId);
            Rsvp saved = rsvpService.respond(parsedEventId, email, response);
            String status = "ACCEPTED".equalsIgnoreCase(saved.getResponse()) ? "accepted" : "declined";
            return redirectToFrontend(status, "Your RSVP response has been recorded.", eventId, email);
        } catch (IllegalStateException e) {
            return redirectToFrontend("already", e.getMessage(), eventId, email);
        } catch (IllegalArgumentException e) {
            return redirectToFrontend("error", e.getMessage(), eventId, email);
        }
    }

    @PostMapping("/respond")
    public ResponseEntity<?> respond(@RequestBody Rsvp rsvp) {
        try {
            Rsvp saved = rsvpService.respond(rsvp.getEventId(), rsvp.getGuestEmail(), rsvp.getResponse());
            return ResponseEntity.ok(saved);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private Integer parseEventId(String eventId) {
        if (eventId == null || eventId.isBlank()) {
            throw new IllegalArgumentException("eventId is required");
        }
        try {
            return Integer.valueOf(eventId.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("eventId is invalid");
        }
    }

    private ResponseEntity<Void> redirectToFrontend(String status, String message, String eventId, String email) {
        String location = frontendUrl
                + "/response-success?status=" + encode(status)
                + "&message=" + encode(message)
                + "&eventId=" + encode(eventId == null ? "" : eventId)
                + "&email=" + encode(email == null ? "" : email);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, URI.create(location).toString())
                .build();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
