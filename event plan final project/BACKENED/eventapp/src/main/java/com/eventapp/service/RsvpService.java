package com.eventapp.service;

import com.eventapp.entity.Event;
import com.eventapp.entity.Guest;
import com.eventapp.entity.Invitation;
import com.eventapp.entity.Rsvp;
import com.eventapp.entity.User;
import com.eventapp.repository.EventRepository;
import com.eventapp.repository.GuestRepository;
import com.eventapp.repository.InvitationRepository;
import com.eventapp.repository.RsvpRepository;
import com.eventapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RsvpService {

    private final RsvpRepository rsvpRepository;
    private final EventRepository eventRepository;
    private final GuestRepository guestRepository;
    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;

    public Rsvp respond(Integer eventId, String email, String response) {
        Event event = getEvent(eventId);
        String normalizedEmail = normalizeEmail(email);
        String normalizedResponse = normalizeResponse(response);

        Guest guest = guestRepository.findFirstByEvent_EventIdAndEmailIgnoreCase(event.getEventId(), normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Guest not found for this event"));

        Rsvp rsvp = rsvpRepository.findByEventIdAndGuestEmailIgnoreCase(event.getEventId(), normalizedEmail)
                .orElseGet(() -> {
                    Rsvp created = new Rsvp();
                    created.setEventId(event.getEventId());
                    created.setGuestEmail(normalizedEmail);
                    created.setResponse("PENDING");
                    return created;
                });

        String currentStatus = normalizeStoredStatus(rsvp.getResponse());
        if (!"PENDING".equals(currentStatus)) {
            throw new IllegalStateException("Already responded");
        }

        rsvp.setResponse(normalizedResponse);
        rsvp.setResponseTime(LocalDateTime.now());

        guest.setRsvpStatus(toGuestStatus(normalizedResponse));
        guestRepository.save(guest);

        return rsvpRepository.save(rsvp);
    }

    public Rsvp ensurePending(Integer eventId, String email) {
        Event event = getEvent(eventId);
        String normalizedEmail = normalizeEmail(email);

        Guest guest = guestRepository.findFirstByEvent_EventIdAndEmailIgnoreCase(event.getEventId(), normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Guest not found for this event"));

        Optional<Rsvp> existing = rsvpRepository.findByEventIdAndGuestEmailIgnoreCase(event.getEventId(), normalizedEmail);
        if (existing.isPresent()) {
            return existing.get();
        }

        if (guest.getRsvpStatus() == null || guest.getRsvpStatus().isBlank()) {
            guest.setRsvpStatus("PENDING");
            guestRepository.save(guest);
        }

        Rsvp pending = new Rsvp();
        pending.setEventId(event.getEventId());
        pending.setGuestEmail(normalizedEmail);
        pending.setResponse("PENDING");
        return rsvpRepository.save(pending);
    }

    public List<Rsvp> getAll() {
        return rsvpRepository.findAll();
    }

    public Optional<Rsvp> getById(Integer id) {
        return rsvpRepository.findById(id);
    }

    public List<Rsvp> getByEvent(Integer eventId) {
        return rsvpRepository.findByEventId(eventId);
    }

    public List<Rsvp> getByGuest(String email) {
        return rsvpRepository.findByGuestEmail(normalizeEmail(email));
    }

    public List<EventResponseSummary> getResponsesForEvent(Integer eventId, String actorEmail) {
        Event event = getEvent(eventId);
        assertCanViewResponses(event, actorEmail);

        Map<String, Rsvp> responsesByEmail = rsvpRepository.findByEventId(eventId).stream()
                .collect(Collectors.toMap(
                        rsvp -> normalizeEmail(rsvp.getGuestEmail()),
                        Function.identity(),
                        (left, right) -> {
                            LocalDateTime leftTime = left.getResponseTime();
                            LocalDateTime rightTime = right.getResponseTime();
                            if (leftTime == null) return right;
                            if (rightTime == null) return left;
                            return rightTime.isAfter(leftTime) ? right : left;
                        }
                ));

        Map<Integer, Guest> invitedGuests = invitationRepository.findByEvent_EventId(eventId).stream()
                .map(Invitation::getGuest)
                .filter(Objects::nonNull)
                .filter(guest -> guest.getGuestId() != null)
                .collect(Collectors.toMap(
                        Guest::getGuestId,
                        Function.identity(),
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        return invitedGuests.values().stream()
                .sorted(Comparator.comparing(this::sortableGuestValue, String.CASE_INSENSITIVE_ORDER))
                .map(guest -> {
                    String normalizedEmail = guest.getEmail() == null || guest.getEmail().isBlank()
                            ? null
                            : guest.getEmail().trim().toLowerCase(Locale.ROOT);
                    Rsvp rsvp = normalizedEmail == null ? null : responsesByEmail.get(normalizedEmail);
                    String status = rsvp != null
                            ? normalizeStoredStatus(rsvp.getResponse())
                            : normalizeStoredStatus(guest.getRsvpStatus());
                    return new EventResponseSummary(
                            guest.getName(),
                            guest.getEmail(),
                            status,
                            rsvp != null ? rsvp.getResponseTime() : null
                    );
                })
                .toList();
    }

    private String sortableGuestValue(Guest guest) {
        if (guest.getEmail() != null && !guest.getEmail().isBlank()) {
            return guest.getEmail();
        }
        if (guest.getName() != null && !guest.getName().isBlank()) {
            return guest.getName();
        }
        return "";
    }

    private void assertCanViewResponses(Event event, String actorEmail) {
        User actor = userRepository.findByEmailIgnoreCase(actorEmail)
                .orElseThrow(() -> new SecurityException("Access denied"));
        if (actor.getRole() != null && actor.getRole().equalsIgnoreCase("ADMIN")) {
            return;
        }
        Integer organizerId = event.getOrganizer() != null ? event.getOrganizer().getUserId() : null;
        if (organizerId != null && organizerId.equals(actor.getUserId())) {
            return;
        }
        throw new SecurityException("Access denied");
    }

    private Event getEvent(Integer eventId) {
        if (eventId == null) {
            throw new IllegalArgumentException("eventId is required");
        }
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeResponse(String response) {
        if (response == null || response.isBlank()) {
            throw new IllegalArgumentException("response is required");
        }
        String value = response.trim().toLowerCase(Locale.ROOT);
        return switch (value) {
            case "yes", "y", "accept", "accepted" -> "ACCEPTED";
            case "no", "n", "decline", "declined" -> "DECLINED";
            default -> throw new IllegalArgumentException("response must be yes or no");
        };
    }

    private String normalizeStoredStatus(String response) {
        if (response == null || response.isBlank()) {
            return "PENDING";
        }
        String value = response.trim().toUpperCase(Locale.ROOT);
        if ("YES".equals(value)) return "ACCEPTED";
        if ("NO".equals(value)) return "DECLINED";
        if ("MAYBE".equals(value)) return "PENDING";
        return value;
    }

    private String toGuestStatus(String responseStatus) {
        return switch (responseStatus) {
            case "ACCEPTED" -> "YES";
            case "DECLINED" -> "NO";
            default -> "PENDING";
        };
    }

    public record EventResponseSummary(
            String guestName,
            String email,
            String responseStatus,
            LocalDateTime responseTime
    ) {}
}
