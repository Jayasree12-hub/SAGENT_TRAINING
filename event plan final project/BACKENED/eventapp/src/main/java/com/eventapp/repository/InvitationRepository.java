package com.eventapp.repository;
import com.eventapp.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface InvitationRepository extends JpaRepository<Invitation, Integer> {
    List<Invitation> findByEvent_EventId(Integer eventId);
    List<Invitation> findByGuest_GuestId(Integer guestId);
}
