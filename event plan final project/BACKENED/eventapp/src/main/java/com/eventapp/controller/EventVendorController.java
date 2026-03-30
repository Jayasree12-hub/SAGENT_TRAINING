package com.eventapp.controller;

import com.eventapp.entity.EventVendor;
import com.eventapp.service.EventVendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/event-vendors")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EventVendorController {
    private final EventVendorService eventVendorService;

    @GetMapping
    public List<EventVendor> getAll() { return eventVendorService.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<EventVendor> getById(@PathVariable Integer id) {
        return eventVendorService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public EventVendor create(@RequestBody EventVendor ev) { return eventVendorService.create(ev); }

    @PutMapping("/{id}")
    public ResponseEntity<EventVendor> update(@PathVariable Integer id, @RequestBody EventVendor ev) {
        try { return ResponseEntity.ok(eventVendorService.update(id, ev)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        eventVendorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/event/{eventId}")
    public List<EventVendor> getByEvent(@PathVariable Integer eventId) { return eventVendorService.getByEvent(eventId); }

    @GetMapping("/vendor/{vendorId}")
    public List<EventVendor> getByVendor(@PathVariable Integer vendorId) { return eventVendorService.getByVendor(vendorId); }
}
