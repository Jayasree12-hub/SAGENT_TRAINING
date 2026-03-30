package com.eventapp.service;

import com.eventapp.entity.Event;
import com.eventapp.entity.EventGroup;
import com.eventapp.entity.GroupForum;
import com.eventapp.entity.User;
import com.eventapp.repository.BudgetRepository;
import com.eventapp.repository.DirectMessageRepository;
import com.eventapp.repository.EventGroupRepository;
import com.eventapp.repository.EventMemberRepository;
import com.eventapp.repository.EventRepository;
import com.eventapp.repository.EventVendorRepository;
import com.eventapp.repository.GroupForumRepository;
import com.eventapp.repository.GuestRepository;
import com.eventapp.repository.InvitationRepository;
import com.eventapp.repository.MessageRepository;
import com.eventapp.repository.TaskRepository;
import com.eventapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final ChatService chatService;
    private final ChatRealtimeService chatRealtimeService;
    private final TaskRepository taskRepository;
    private final EventMemberRepository eventMemberRepository;
    private final EventGroupRepository eventGroupRepository;
    private final GroupForumRepository groupForumRepository;
    private final MessageRepository messageRepository;
    private final DirectMessageRepository directMessageRepository;
    private final GuestRepository guestRepository;
    private final InvitationRepository invitationRepository;
    private final BudgetRepository budgetRepository;
    private final EventVendorRepository eventVendorRepository;

    public List<Event> getAllEvents(String actorEmail) {
        return chatService.getAccessibleEvents(actorEmail);
    }

    public Optional<Event> getEventById(Integer id, String actorEmail) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
        User actor = getActor(actorEmail);
        if (chatService.getParticipantIdsForEvent(id).contains(actor.getUserId())
                || isAdmin(actor)
                || (event.getOrganizer() != null && event.getOrganizer().getUserId().equals(actor.getUserId()))) {
            return Optional.of(event);
        }
        return Optional.empty();
    }

    public Event createEvent(Event event, String actorEmail) {
        User actor = getActor(actorEmail);
        if (!isAdmin(actor)) {
            event.setOrganizer(actor);
        } else if (event.getOrganizer() == null) {
            event.setOrganizer(actor);
        }

        Event saved = eventRepository.save(event);
        chatService.ensureEventChat(saved, actor);
        chatRealtimeService.notifyUsers(List.of(actor.getUserId()), "EVENT_CREATED");
        return saved;
    }

    public Event updateEvent(Integer id, Event updated, String actorEmail) {
        User actor = getActor(actorEmail);
        return eventRepository.findById(id).map(event -> {
            assertCanManageEvent(actor, event);
            event.setEventName(updated.getEventName());
            event.setEventType(updated.getEventType());
            event.setEventDate(updated.getEventDate());
            event.setVenue(updated.getVenue());
            event.setDescription(updated.getDescription());
            event.setStatus(updated.getStatus());

            if (isAdmin(actor) && updated.getOrganizer() != null) {
                event.setOrganizer(updated.getOrganizer());
            } else if (event.getOrganizer() == null) {
                event.setOrganizer(actor);
            }

            Event saved = eventRepository.save(event);
            chatService.ensureEventChat(saved, actor);
            chatService.notifyEventParticipants(saved.getEventId(), "EVENT_UPDATED");
            return saved;
        }).orElseThrow(() -> new RuntimeException("Event not found: " + id));
    }

    @Transactional
    public void deleteEvent(Integer id, String actorEmail) {
        User actor = getActor(actorEmail);
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
        assertCanManageEvent(actor, event);

        List<Integer> participants = chatService.getParticipantIdsForEvent(id).stream().toList();
        deleteEventRelations(id);
        eventRepository.delete(event);
        chatRealtimeService.notifyUsers(participants, "EVENT_DELETED");
    }

    private void deleteEventRelations(Integer eventId) {
        List<EventGroup> groups = eventGroupRepository.findByEvent_EventId(eventId);
        for (EventGroup group : groups) {
            List<GroupForum> forums = groupForumRepository.findByGroup_GroupId(group.getGroupId());
            for (GroupForum forum : forums) {
                messageRepository.deleteAll(messageRepository.findByForum_ForumId(forum.getForumId()));
            }
            groupForumRepository.deleteAll(forums);
        }

        directMessageRepository.deleteAll(directMessageRepository.findByEvent_EventId(eventId));
        invitationRepository.deleteAll(invitationRepository.findByEvent_EventId(eventId));
        eventVendorRepository.deleteAll(eventVendorRepository.findByEvent_EventId(eventId));
        budgetRepository.deleteAll(budgetRepository.findByEvent_EventId(eventId));
        taskRepository.deleteAll(taskRepository.findByEvent_EventId(eventId));
        eventMemberRepository.deleteAll(eventMemberRepository.findByEvent_EventId(eventId));
        guestRepository.deleteAll(guestRepository.findByEvent_EventId(eventId));
        eventGroupRepository.deleteAll(groups);
    }

    public List<Event> getEventsByOrganizer(Integer organizerId) {
        return eventRepository.findByOrganizer_UserId(organizerId);
    }

    public List<Event> getEventsByStatus(String status) {
        return eventRepository.findByStatus(status);
    }

    public List<Event> getEventsByType(String type) {
        return eventRepository.findByEventType(type);
    }

    private User getActor(String actorEmail) {
        return userRepository.findByEmailIgnoreCase(actorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void assertCanManageEvent(User actor, Event event) {
        if (isAdmin(actor)) {
            return;
        }
        if (event.getOrganizer() != null && event.getOrganizer().getUserId().equals(actor.getUserId())) {
            return;
        }
        throw new RuntimeException("Only the organizer can manage this event");
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && user.getRole().equalsIgnoreCase("ADMIN");
    }
}
