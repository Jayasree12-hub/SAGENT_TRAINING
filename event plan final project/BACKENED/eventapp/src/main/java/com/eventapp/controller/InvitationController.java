package com.eventapp.controller;

import com.eventapp.entity.Invitation;
import com.eventapp.service.InvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InvitationController {
    private final InvitationService invitationService;

    @GetMapping
    public List<Invitation> getAll() { return invitationService.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Invitation> getById(@PathVariable Integer id) {
        return invitationService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Invitation create(@RequestBody Invitation invitation) { return invitationService.create(invitation); }

    @PutMapping("/{id}")
    public ResponseEntity<Invitation> update(@PathVariable Integer id, @RequestBody Invitation invitation) {
        try { return ResponseEntity.ok(invitationService.update(id, invitation)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        invitationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/event/{eventId}")
    public List<Invitation> getByEvent(@PathVariable Integer eventId) { return invitationService.getByEvent(eventId); }

    @GetMapping("/guest/{guestId}")
    public List<Invitation> getByGuest(@PathVariable Integer guestId) { return invitationService.getByGuest(guestId); }
}
