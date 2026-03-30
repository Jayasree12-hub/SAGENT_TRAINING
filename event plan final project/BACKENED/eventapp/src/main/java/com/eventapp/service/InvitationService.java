package com.eventapp.service;

import com.eventapp.entity.Event;
import com.eventapp.entity.Guest;
import com.eventapp.entity.Invitation;
import com.eventapp.repository.EventRepository;
import com.eventapp.repository.GuestRepository;
import com.eventapp.repository.InvitationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvitationService {
    private final InvitationRepository invitationRepository;
    private final EventRepository eventRepository;
    private final GuestRepository guestRepository;
    private final EmailService emailService;
    private final RsvpService rsvpService;

    public List<Invitation> getAll() { return invitationRepository.findAll(); }

    public Optional<Invitation> getById(Integer id) { return invitationRepository.findById(id); }

    public Invitation create(Invitation invitation) {
        Integer eventId = invitation.getEvent() != null ? invitation.getEvent().getEventId() : null;
        Integer guestId = invitation.getGuest() != null ? invitation.getGuest().getGuestId() : null;
        if (eventId == null || guestId == null) {
            throw new RuntimeException("Event and guest are required");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Guest not found: " + guestId));

        invitation.setEvent(event);
        invitation.setGuest(guest);
        if (invitation.getSentAt() == null) {
            invitation.setSentAt(LocalDateTime.now());
        }

        Invitation saved = invitationRepository.save(invitation);
        rsvpService.ensurePending(event.getEventId(), guest.getEmail());
        emailService.sendInvitationEmail(
                guest.getEmail(),
                event.getEventName(),
                event.getEventDate() != null ? event.getEventDate().toString() : "",
                event.getVenue(),
                event.getEventId().longValue(),
                invitation.getCustomMessage()
        );
        return saved;
    }

    public Invitation update(Integer id, Invitation updated) {
        return invitationRepository.findById(id).map(i -> {
            i.setEvent(updated.getEvent());
            i.setGuest(updated.getGuest());
            i.setTemplateName(updated.getTemplateName());
            i.setCustomMessage(updated.getCustomMessage());
            i.setSentAt(updated.getSentAt());
            return invitationRepository.save(i);
        }).orElseThrow(() -> new RuntimeException("Invitation not found: " + id));
    }

    public void delete(Integer id) { invitationRepository.deleteById(id); }

    public List<Invitation> getByEvent(Integer eventId) { return invitationRepository.findByEvent_EventId(eventId); }

    public List<Invitation> getByGuest(Integer guestId) { return invitationRepository.findByGuest_GuestId(guestId); }
}
