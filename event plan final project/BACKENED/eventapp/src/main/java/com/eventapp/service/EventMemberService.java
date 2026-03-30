package com.eventapp.service;

import com.eventapp.entity.EventMember;
import com.eventapp.repository.EventMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EventMemberService {
    private final EventMemberRepository eventMemberRepository;
    private final ChatService chatService;

    public List<EventMember> getAll() { return eventMemberRepository.findAll(); }

    public Optional<EventMember> getById(Integer id) { return eventMemberRepository.findById(id); }

    public EventMember create(EventMember em) {
        if (em.getStatus() == null || em.getStatus().isBlank()) {
            em.setStatus("ACTIVE");
        }
        if (em.getEvent() == null || em.getEvent().getEventId() == null
                || em.getUser() == null || em.getUser().getUserId() == null) {
            return eventMemberRepository.save(em);
        }

        EventMember saved = eventMemberRepository.findByEvent_EventIdAndUser_UserId(
                em.getEvent().getEventId(),
                em.getUser().getUserId()
        ).map(existing -> {
            existing.setRoleInEvent(em.getRoleInEvent());
            existing.setStatus(em.getStatus());
            existing.setRejectReason(em.getRejectReason());
            return eventMemberRepository.save(existing);
        }).orElseGet(() -> eventMemberRepository.save(em));

        notifyEventParticipants(saved);
        return saved;
    }

    public EventMember update(Integer id, EventMember updated) {
        EventMember saved = eventMemberRepository.findById(id).map(em -> {
            em.setEvent(updated.getEvent());
            em.setUser(updated.getUser());
            em.setRoleInEvent(updated.getRoleInEvent());
            em.setStatus(updated.getStatus());
            em.setRejectReason(updated.getRejectReason());
            return eventMemberRepository.save(em);
        }).orElseThrow(() -> new RuntimeException("EventMember not found: " + id));

        notifyEventParticipants(saved);
        return saved;
    }

    public void delete(Integer id) { eventMemberRepository.deleteById(id); }

    public List<EventMember> getByEvent(Integer eventId) { return eventMemberRepository.findByEvent_EventId(eventId); }

    public List<EventMember> getByUser(Integer userId) { return eventMemberRepository.findByUser_UserId(userId); }

    public List<EventMember> getByStatus(String status) { return eventMemberRepository.findByStatus(status); }

    private void notifyEventParticipants(EventMember eventMember) {
        if (eventMember == null || eventMember.getEvent() == null || eventMember.getEvent().getEventId() == null) {
            return;
        }
        chatService.notifyEventParticipants(eventMember.getEvent().getEventId(), "EVENT_MEMBER_UPDATED");
    }
}
