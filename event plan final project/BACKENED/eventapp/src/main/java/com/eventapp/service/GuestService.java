package com.eventapp.service;

import com.eventapp.entity.Guest;
import com.eventapp.repository.GuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GuestService {
    private final GuestRepository guestRepository;

    public List<Guest> getAll() { return guestRepository.findAll(); }

    public Optional<Guest> getById(Integer id) { return guestRepository.findById(id); }

    public Guest create(Guest guest) { return guestRepository.save(guest); }

    public Guest update(Integer id, Guest updated) {
        return guestRepository.findById(id).map(g -> {
            g.setEvent(updated.getEvent());
            g.setName(updated.getName());
            g.setEmail(updated.getEmail());
            g.setPhone(updated.getPhone());
            g.setRsvpStatus(updated.getRsvpStatus());
            g.setAttendanceStatus(updated.getAttendanceStatus());
            return guestRepository.save(g);
        }).orElseThrow(() -> new RuntimeException("Guest not found: " + id));
    }

    public void delete(Integer id) { guestRepository.deleteById(id); }

    public List<Guest> getByEvent(Integer eventId) { return guestRepository.findByEvent_EventId(eventId); }

    public List<Guest> getByRsvpStatus(String status) { return guestRepository.findByRsvpStatus(status); }
}
