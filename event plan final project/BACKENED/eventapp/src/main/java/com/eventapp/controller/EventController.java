package com.eventapp.controller;

import com.eventapp.entity.Event;
import com.eventapp.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @GetMapping
    public List<Event> getAll(Authentication authentication) {
        return eventService.getAllEvents(authentication.getName());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getById(@PathVariable Integer id, Authentication authentication) {
        return eventService.getEventById(id, authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Event create(@RequestBody Event event, Authentication authentication) {
        return eventService.createEvent(event, authentication.getName());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> update(@PathVariable Integer id,
                                        @RequestBody Event event,
                                        Authentication authentication) {
        try { return ResponseEntity.ok(eventService.updateEvent(id, event, authentication.getName())); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, Authentication authentication) {
        try {
            eventService.deleteEvent(id, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/organizer/{organizerId}")
    public List<Event> getByOrganizer(@PathVariable Integer organizerId) { return eventService.getEventsByOrganizer(organizerId); }

    @GetMapping("/status/{status}")
    public List<Event> getByStatus(@PathVariable String status) { return eventService.getEventsByStatus(status); }

    @GetMapping("/type/{type}")
    public List<Event> getByType(@PathVariable String type) { return eventService.getEventsByType(type); }
}
