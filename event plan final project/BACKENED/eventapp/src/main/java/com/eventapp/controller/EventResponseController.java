package com.eventapp.controller;

import com.eventapp.service.RsvpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/event")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EventResponseController {

    private final RsvpService rsvpService;

    @GetMapping("/{eventId}/responses")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public ResponseEntity<List<EventResponseDto>> getResponses(@PathVariable Integer eventId, Authentication authentication) {
        try {
            List<EventResponseDto> responses = rsvpService.getResponsesForEvent(eventId, authentication.getName()).stream()
                    .map(item -> new EventResponseDto(
                            item.guestName(),
                            item.email(),
                            item.responseStatus(),
                            item.responseTime()
                    ))
                    .toList();
            return ResponseEntity.ok(responses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    public record EventResponseDto(
            String guestName,
            String email,
            String responseStatus,
            LocalDateTime responseTime
    ) {}
}
