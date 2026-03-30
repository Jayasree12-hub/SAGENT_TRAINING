package com.eventapp.controller;

import com.eventapp.entity.EventGroup;
import com.eventapp.service.EventGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/event-groups")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EventGroupController {
    private final EventGroupService eventGroupService;

    @GetMapping
    public List<EventGroup> getAll() { return eventGroupService.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<EventGroup> getById(@PathVariable Integer id) {
        return eventGroupService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public EventGroup create(@RequestBody EventGroup eg) { return eventGroupService.create(eg); }

    @PutMapping("/{id}")
    public ResponseEntity<EventGroup> update(@PathVariable Integer id, @RequestBody EventGroup eg) {
        try { return ResponseEntity.ok(eventGroupService.update(id, eg)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        eventGroupService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/event/{eventId}")
    public List<EventGroup> getByEvent(@PathVariable Integer eventId) { return eventGroupService.getByEvent(eventId); }

    @GetMapping("/join/{joinCode}")
    public ResponseEntity<EventGroup> getByJoinCode(@PathVariable String joinCode) {
        return eventGroupService.getByJoinCode(joinCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
