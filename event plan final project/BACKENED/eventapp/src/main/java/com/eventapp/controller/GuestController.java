package com.eventapp.controller;

import com.eventapp.entity.Guest;
import com.eventapp.service.GuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/guests")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GuestController {
    private final GuestService guestService;

    @GetMapping
    public List<Guest> getAll() { return guestService.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Guest> getById(@PathVariable Integer id) {
        return guestService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Guest create(@RequestBody Guest guest) { return guestService.create(guest); }

    @PutMapping("/{id}")
    public ResponseEntity<Guest> update(@PathVariable Integer id, @RequestBody Guest guest) {
        try { return ResponseEntity.ok(guestService.update(id, guest)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        guestService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/event/{eventId}")
    public List<Guest> getByEvent(@PathVariable Integer eventId) { return guestService.getByEvent(eventId); }

    @GetMapping("/rsvp/{status}")
    public List<Guest> getByRsvpStatus(@PathVariable String status) { return guestService.getByRsvpStatus(status); }
}
