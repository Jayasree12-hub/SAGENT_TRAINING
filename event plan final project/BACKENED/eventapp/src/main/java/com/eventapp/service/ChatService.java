package com.eventapp.service;

import com.eventapp.entity.DirectMessage;
import com.eventapp.entity.Event;
import com.eventapp.entity.EventGroup;
import com.eventapp.entity.EventMember;
import com.eventapp.entity.GroupForum;
import com.eventapp.entity.Message;
import com.eventapp.entity.Task;
import com.eventapp.entity.User;
import com.eventapp.repository.DirectMessageRepository;
import com.eventapp.repository.EventGroupRepository;
import com.eventapp.repository.EventMemberRepository;
import com.eventapp.repository.EventRepository;
import com.eventapp.repository.GroupForumRepository;
import com.eventapp.repository.MessageRepository;
import com.eventapp.repository.TaskRepository;
import com.eventapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TaskRepository taskRepository;
    private final EventMemberRepository eventMemberRepository;
    private final EventGroupRepository eventGroupRepository;
    private final GroupForumRepository groupForumRepository;
    private final MessageRepository messageRepository;
    private final DirectMessageRepository directMessageRepository;
    private final ChatRealtimeService chatRealtimeService;

    public ChatInbox getInbox(String email) {
        User me = getUserByEmail(email);
        List<Event> accessibleEvents = getAccessibleEventsForUser(me);

        List<GroupConversation> groups = new ArrayList<>();
        Map<Integer, User> contacts = new LinkedHashMap<>();

        for (Event event : accessibleEvents) {
            groups.add(buildGroupConversation(event, me));
            for (User participant : collectParticipants(event)) {
                addContact(contacts, me, participant);
            }
        }

        List<DirectConversation> directMessages = buildDirectConversations(me, contacts);
        directMessages.forEach(conversation -> addContact(contacts, me, conversation.otherUser()));

        groups.sort((left, right) -> compareConversationActivity(
                right.lastActivityAt(), right.eventDate(),
                left.lastActivityAt(), left.eventDate()
        ));
        directMessages.sort((left, right) -> compareConversationActivity(
                right.lastActivityAt(), null,
                left.lastActivityAt(), null
        ));

        List<User> sortedContacts = contacts.values().stream()
                .sorted(Comparator.comparing(this::displayName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        return new ChatInbox(groups, directMessages, sortedContacts);
    }

    public List<Event> getAccessibleEvents(String email) {
        return getAccessibleEventsForUser(getUserByEmail(email));
    }

    public List<User> getMembersForEvent(Integer eventId, String email) {
        User me = getUserByEmail(email);
        Event event = getEvent(eventId);
        assertEventAccess(me, event);
        return new ArrayList<>(collectParticipants(event));
    }

    public List<Message> getGroupMessages(Integer eventId, String email) {
        User me = getUserByEmail(email);
        Event event = getEvent(eventId);
        assertEventAccess(me, event);
        GroupForum forum = ensureForum(event, me);
        return messageRepository.findByForum_ForumIdOrderBySentAtAsc(forum.getForumId());
    }

    public Message sendGroupMessage(Integer eventId, String email, String messageText) {
        String text = safeText(messageText);
        User me = getUserByEmail(email);
        Event event = getEvent(eventId);
        assertEventAccess(me, event);
        GroupForum forum = ensureForum(event, me);

        Message message = new Message();
        message.setForum(forum);
        message.setSender(me);
        message.setMessageText(text);
        message.setSentAt(LocalDateTime.now());

        Message saved = messageRepository.save(message);
        Map<String, Object> payload = new HashMap<>();
        payload.put("reason", "GROUP_MESSAGE");
        payload.put("eventId", eventId);
        payload.put("senderId", me.getUserId());
        payload.put("senderName", displayName(me));
        payload.put("sentAt", saved.getSentAt() != null ? saved.getSentAt().toString() : LocalDateTime.now().toString());
        chatRealtimeService.notifyUsers(getParticipantIdsForEvent(eventId), payload);
        return saved;
    }

    public List<DirectMessage> getDirectMessages(String email, Integer otherUserId) {
        User me = getUserByEmail(email);
        User other = getUserById(otherUserId);
        assertCanDirectMessage(me, other);
        return directMessageRepository.findConversation(me.getUserId(), other.getUserId());
    }

    // Backward-compatible signature for controller/clients that still pass eventId
    public List<DirectMessage> getDirectMessages(Integer eventId, String email, Integer otherUserId) {
        return getDirectMessages(email, otherUserId);
    }

    public DirectMessage sendDirectMessage(String email, Integer otherUserId, String messageText) {
        String text = safeText(messageText);
        User me = getUserByEmail(email);
        User other = getUserById(otherUserId);
        assertCanDirectMessage(me, other);

        DirectMessage dm = new DirectMessage();
        dm.setEvent(findSharedEvent(me, other).orElse(null));
        dm.setSender(me);
        dm.setReceiver(other);
        dm.setMessageText(text);
        dm.setSentAt(LocalDateTime.now());

        DirectMessage saved = directMessageRepository.save(dm);
        Map<String, Object> payload = new HashMap<>();
        payload.put("reason", "DIRECT_MESSAGE");
        payload.put("eventId", saved.getEvent() != null ? saved.getEvent().getEventId() : null);
        payload.put("senderId", me.getUserId());
        payload.put("senderName", displayName(me));
        payload.put("receiverId", other.getUserId());
        payload.put("sentAt", saved.getSentAt() != null ? saved.getSentAt().toString() : LocalDateTime.now().toString());
        chatRealtimeService.notifyUsers(List.of(me.getUserId(), other.getUserId()), payload);
        return saved;
    }

    // Backward-compatible signature for controller/clients that still pass eventId
    public DirectMessage sendDirectMessage(Integer eventId, String email, Integer otherUserId, String messageText) {
        return sendDirectMessage(email, otherUserId, messageText);
    }

    public EventGroup ensureEventChat(Event event, User actor) {
        if (event == null || event.getEventId() == null) {
            throw new RuntimeException("Event must be saved before chat can be provisioned");
        }

        User creator = event.getOrganizer() != null ? event.getOrganizer() : actor;
        EventGroup group = eventGroupRepository.findFirstByEvent_EventId(event.getEventId())
                .orElseGet(() -> {
                    EventGroup created = new EventGroup();
                    created.setEvent(event);
                    created.setCreatedBy(creator);
                    created.setJoinCode(randomJoinCode());
                    return eventGroupRepository.save(created);
                });

        boolean groupChanged = false;
        if (group.getCreatedBy() == null && creator != null) {
            group.setCreatedBy(creator);
            groupChanged = true;
        }
        if (group.getJoinCode() == null || group.getJoinCode().isBlank()) {
            group.setJoinCode(randomJoinCode());
            groupChanged = true;
        }
        if (groupChanged) {
            group = eventGroupRepository.save(group);
        }

        EventGroup groupRef = group;
        GroupForum forum = groupForumRepository.findFirstByGroup_GroupId(group.getGroupId())
                .orElseGet(() -> createForum(groupRef, event));

        String expectedForumName = buildForumName(event);
        if (!Objects.equals(forum.getForumName(), expectedForumName)
                || forum.getSpecialization() == null
                || forum.getSpecialization().isBlank()) {
            forum.setForumName(expectedForumName);
            forum.setSpecialization("Event Chat");
            groupForumRepository.save(forum);
        }

        return group;
    }

    public Set<Integer> getParticipantIdsForEvent(Integer eventId) {
        Event event = getEvent(eventId);
        LinkedHashSet<Integer> participantIds = new LinkedHashSet<>();
        for (User participant : collectParticipants(event)) {
            if (participant.getUserId() != null) {
                participantIds.add(participant.getUserId());
            }
        }
        return participantIds;
    }

    public void notifyEventParticipants(Integer eventId, String reason) {
        chatRealtimeService.notifyUsers(getParticipantIdsForEvent(eventId), reason);
    }

    private List<Event> getAccessibleEventsForUser(User user) {
        if (isAdmin(user)) {
            return eventRepository.findAll();
        }
        if (isOrganizer(user)) {
            List<Event> owned = eventRepository.findByOrganizer_UserId(user.getUserId());
            if (owned.isEmpty()) {
                List<Event> legacy = eventRepository.findByOrganizerIsNull();
                if (!legacy.isEmpty()) {
                    return legacy;
                }
            }
            return owned;
        }

        Map<Integer, Event> events = new LinkedHashMap<>();
        for (Task task : taskRepository.findByAssignedTo_UserId(user.getUserId())) {
            if (task.getEvent() != null && task.getEvent().getEventId() != null) {
                events.put(task.getEvent().getEventId(), task.getEvent());
            }
        }
        for (EventMember member : eventMemberRepository.findByUser_UserId(user.getUserId())) {
            if (member.getEvent() != null && member.getEvent().getEventId() != null && isActiveMember(member)) {
                events.put(member.getEvent().getEventId(), member.getEvent());
            }
        }
        return new ArrayList<>(events.values());
    }

    private GroupConversation buildGroupConversation(Event event, User actor) {
        EventGroup group = ensureEventChat(event, actor);
        GroupForum forum = groupForumRepository.findFirstByGroup_GroupId(group.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group forum not found"));
        Message latestMessage = messageRepository.findTopByForum_ForumIdOrderBySentAtDesc(forum.getForumId())
                .orElse(null);

        return new GroupConversation(
                event.getEventId(),
                event.getEventName(),
                event.getEventType(),
                event.getEventDate(),
                event.getVenue(),
                preview(latestMessage != null ? latestMessage.getMessageText() : null),
                latestMessage != null ? latestMessage.getSentAt() : null,
                collectParticipants(event).size()
        );
    }

    private List<DirectConversation> buildDirectConversations(User me, Map<Integer, User> contacts) {
        Map<Integer, DirectConversation> conversations = new LinkedHashMap<>();
        for (DirectMessage dm : directMessageRepository.findAllForUserOrderBySentAtDesc(me.getUserId())) {
            User other = getOtherParticipant(dm, me);
            if (other == null || other.getUserId() == null) {
                continue;
            }
            contacts.putIfAbsent(other.getUserId(), other);
            conversations.computeIfAbsent(other.getUserId(), ignored -> new DirectConversation(
                    other,
                    preview(dm.getMessageText()),
                    dm.getSentAt(),
                    dm.getSender() != null ? dm.getSender().getUserId() : null
            ));
        }
        return new ArrayList<>(conversations.values());
    }

    private GroupForum ensureForum(Event event, User actor) {
        EventGroup group = ensureEventChat(event, actor);
        return groupForumRepository.findFirstByGroup_GroupId(group.getGroupId())
                .orElseGet(() -> createForum(group, event));
    }

    private GroupForum createForum(EventGroup group, Event event) {
        GroupForum forum = new GroupForum();
        forum.setGroup(group);
        forum.setForumName(buildForumName(event));
        forum.setSpecialization("Event Chat");
        return groupForumRepository.save(forum);
    }

    private LinkedHashSet<User> collectParticipants(Event event) {
        LinkedHashMap<Integer, User> participants = new LinkedHashMap<>();
        addParticipant(participants, event.getOrganizer());

        for (Task task : taskRepository.findByEvent_EventId(event.getEventId())) {
            addParticipant(participants, task.getAssignedTo());
        }

        for (EventMember member : eventMemberRepository.findByEvent_EventId(event.getEventId())) {
            if (isActiveMember(member)) {
                addParticipant(participants, member.getUser());
            }
        }

        return new LinkedHashSet<>(participants.values());
    }

    private void assertEventAccess(User user, Event event) {
        if (isAdmin(user)) {
            return;
        }
        if (event.getOrganizer() != null && Objects.equals(event.getOrganizer().getUserId(), user.getUserId())) {
            return;
        }
        if (event.getOrganizer() == null && isOrganizer(user)) {
            return;
        }
        if (!getParticipantIdsForEvent(event.getEventId()).contains(user.getUserId())) {
            throw new RuntimeException("Access denied for this event");
        }
    }

    private void assertCanDirectMessage(User me, User other) {
        if (me.getUserId() == null || other.getUserId() == null) {
            throw new RuntimeException("Users must be saved before messaging");
        }
        if (Objects.equals(me.getUserId(), other.getUserId())) {
            throw new RuntimeException("Cannot message yourself");
        }

        boolean shareEvent = findSharedEvent(me, other).isPresent();
        boolean existingConversation = directMessageRepository.existsConversationBetween(me.getUserId(), other.getUserId());
        boolean allowedAdHocConversation = canStartDirectMessageWithoutSharedEvent(me, other);

        if (!shareEvent && !existingConversation && !allowedAdHocConversation && !isAdmin(me)) {
            throw new RuntimeException("You can only message people from your event chats");
        }
    }

    private Optional<Event> findSharedEvent(User me, User other) {
        for (Event event : getAccessibleEventsForUser(me)) {
            if (getParticipantIdsForEvent(event.getEventId()).contains(other.getUserId())) {
                return Optional.of(event);
            }
        }
        return Optional.empty();
    }

    private User getOtherParticipant(DirectMessage dm, User me) {
        if (dm.getSender() != null && Objects.equals(dm.getSender().getUserId(), me.getUserId())) {
            return dm.getReceiver();
        }
        return dm.getSender();
    }

    private void addParticipant(Map<Integer, User> participants, User user) {
        if (user == null || user.getUserId() == null || isVendor(user)) {
            return;
        }
        participants.put(user.getUserId(), user);
    }

    private void addContact(Map<Integer, User> contacts, User me, User user) {
        if (user == null || user.getUserId() == null || isVendor(user)) {
            return;
        }
        if (Objects.equals(user.getUserId(), me.getUserId())) {
            return;
        }
        contacts.putIfAbsent(user.getUserId(), user);
    }

    private boolean isActiveMember(EventMember member) {
        if (member == null) {
            return false;
        }
        String status = member.getStatus();
        if (status == null || status.isBlank()) {
            return true;
        }
        String normalized = status.trim().toUpperCase();
        return !"REMOVED".equals(normalized) && !"REJECTED".equals(normalized);
    }

    private int compareConversationActivity(LocalDateTime leftTime, LocalDate leftDate,
                                            LocalDateTime rightTime, LocalDate rightDate) {
        LocalDateTime normalizedLeft = leftTime != null ? leftTime : leftDate != null ? leftDate.atStartOfDay() : null;
        LocalDateTime normalizedRight = rightTime != null ? rightTime : rightDate != null ? rightDate.atStartOfDay() : null;
        if (normalizedLeft == null && normalizedRight == null) {
            return 0;
        }
        if (normalizedLeft == null) {
            return -1;
        }
        if (normalizedRight == null) {
            return 1;
        }
        return normalizedLeft.compareTo(normalizedRight);
    }

    private String preview(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        String compact = text.trim().replaceAll("\\s+", " ");
        return compact.length() <= 72 ? compact : compact.substring(0, 69) + "...";
    }

    private String displayName(User user) {
        if (user == null) {
            return "";
        }
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName().trim();
        }
        return user.getEmail() != null ? user.getEmail() : "";
    }

    private String buildForumName(Event event) {
        String eventName = event.getEventName() == null || event.getEventName().isBlank()
                ? "Event"
                : event.getEventName().trim();
        return eventName + " Group";
    }

    private String randomJoinCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Event getEvent(Integer eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    private boolean isOrganizer(User user) {
        return user.getRole() != null && user.getRole().equalsIgnoreCase("ORGANIZER");
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && user.getRole().equalsIgnoreCase("ADMIN");
    }

    private boolean isVendor(User user) {
        return user.getRole() != null && user.getRole().equalsIgnoreCase("VENDOR");
    }

    private boolean canStartDirectMessageWithoutSharedEvent(User me, User other) {
        return isChatUser(me) && isChatUser(other);
    }

    private boolean isChatUser(User user) {
        return user != null
                && user.getRole() != null
                && !user.getRole().isBlank();
    }

    private String safeText(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new RuntimeException("Message required");
        }
        return text.trim();
    }

    public record ChatInbox(
            List<GroupConversation> groups,
            List<DirectConversation> directMessages,
            List<User> contacts
    ) {}

    public record GroupConversation(
            Integer eventId,
            String eventName,
            String eventType,
            LocalDate eventDate,
            String venue,
            String lastMessage,
            LocalDateTime lastActivityAt,
            Integer participantCount
    ) {}

    public record DirectConversation(
            User otherUser,
            String lastMessage,
            LocalDateTime lastActivityAt,
            Integer lastSenderId
    ) {}
}
