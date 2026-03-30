package com.eventapp.repository;
import com.eventapp.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuestRepository extends JpaRepository<Guest, Integer> {
    List<Guest> findByEvent_EventId(Integer eventId);
    List<Guest> findByRsvpStatus(String rsvpStatus);
    Optional<Guest> findFirstByEvent_EventIdAndEmailIgnoreCase(Integer eventId, String email);
}
