package com.eventapp.repository;



import com.eventapp.entity.Rsvp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RsvpRepository extends JpaRepository<Rsvp, Integer> {

    List<Rsvp> findByEventId(Integer eventId);

    List<Rsvp> findByGuestEmail(String guestEmail);

    Optional<Rsvp> findByEventIdAndGuestEmailIgnoreCase(Integer eventId, String guestEmail);
}
