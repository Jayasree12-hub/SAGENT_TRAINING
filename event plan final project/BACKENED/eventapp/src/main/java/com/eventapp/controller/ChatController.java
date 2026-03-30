package com.eventapp.controller;

import com.eventapp.entity.DirectMessage;
import com.eventapp.entity.Event;
import com.eventapp.entity.Message;
import com.eventapp.entity.User;
import com.eventapp.service.ChatRealtimeService;
import com.eventapp.service.ChatService;
import com.eventapp.service.EventService;
import com.eventapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final ChatRealtimeService chatRealtimeService;
    private final EventService eventService;
    private final UserService userService;

    @GetMapping("/stream")
    @PreAuthorize("hasAnyRole('ORGANIZER','TEAM_MEMBER','ADMIN','VENDOR')")
    public SseEmitter stream(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return chatRealtimeService.subscribe(user.getUserId());
    }

    @GetMapping("/events")
    @PreAuthorize("hasAnyRole('ORGANIZER','TEAM_MEMBER','ADMIN')")
    public List<ChatEventDto> getEvents(Authentication authentication) {
        return chatService.getAccessibleEvents(authentication.getName())
                .stream().map(this::toEventDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/inbox")
    @PreAuthorize("hasAnyRole('ORGANIZER','TEAM_MEMBER','ADMIN','VENDOR')")
    public ChatInboxDto getInbox(Authentication authentication) {
        ChatService.ChatInbox inbox = chatService.getInbox(authentication.getName());

        ChatInboxDto dto = new ChatInboxDto();
        dto.groups = inbox.groups().stream()
                .map(this::toGroupConversationDto)
                .collect(Collectors.toList());
        dto.directMessages = inbox.directMessages().stream()
                .map(this::toDirectConversationDto)
                .collect(Collectors.toList());
        dto.contacts = inbox.contacts().stream()
                .map(this::toMemberDto)
                .collect(Collectors.toList());
        return dto;
    }

    @GetMapping("/events/{eventId}/members")
    @PreAuthorize("hasAnyRole('ORGANIZER','TEAM_MEMBER','ADMIN')")
    public List<ChatMemberDto> getMembers(@PathVariable Integer eventId, Authentication authentication) {
        return chatService.getMembersForEvent(eventId, authentication.getName())
                .stream().map(this::toMemberDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/events/{eventId}/group/messages")
    @PreAuthorize("hasAnyRole('ORGANIZER','TEAM_MEMBER','ADMIN')")
    public List<ChatMessageDto> getGroupMessages(@PathVariable Integer eventId, Authentication authentication) {
        return chatService.getGroupMessages(eventId, authentication.getName())
                .stream().map(this::toGroupMessageDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/events/{eventId}/group/messages")
    @PreAuthorize("hasAnyRole('ORGANIZER','TEAM_MEMBER','ADMIN')")
    public ResponseEntity<ChatMessageDto> sendGroupMessage(@PathVariable Integer eventId,
                                                           @RequestBody SendMessageRequest request,
                                                           Authentication authentication) {
        Message saved = chatService.sendGroupMessage(eventId, authentication.getName(), request.getMessageText());
        return ResponseEntity.ok(toGroupMessageDto(saved));
    }

    @DeleteMapping("/events/{eventId}/group")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public ResponseEntity<Void> deleteGroup(@PathVariable Integer eventId, Authentication authentication) {
        try {
            eventService.deleteEvent(eventId, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/events/{eventId}/dm/{userId}")
    @PreAuthorize("hasAnyRole('ORGANIZER','TEAM_MEMBER','ADMIN')")
    public List<ChatMessageDto> getDirectMessages(@PathVariable Integer eventId,
                                                  @PathVariable Integer userId,
                                                  Authentication authentication) {
        return chatService.getDirectMessages(eventId, authentication.getName(), userId)
                .stream().map(this::toDirectMessageDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/dm/{userId}")
    @PreAuthorize("hasAnyRole('ORGANIZER','TEAM_MEMBER','ADMIN','VENDOR')")
    public List<ChatMessageDto> getDirectMessages(@PathVariable Integer userId, Authentication authentication) {
        return chatService.getDirectMessages(authentication.getName(), userId)
                .stream().map(this::toDirectMessageDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/events/{eventId}/dm/{userId}")
    @PreAuthorize("hasAnyRole('ORGANIZER','TEAM_MEMBER','ADMIN')")
    public ResponseEntity<ChatMessageDto> sendDirectMessage(@PathVariable Integer eventId,
                                                            @PathVariable Integer userId,
                                                            @RequestBody SendMessageRequest request,
                                                            Authentication authentication) {
        DirectMessage saved = chatService.sendDirectMessage(eventId, authentication.getName(), userId, request.getMessageText());
        return ResponseEntity.ok(toDirectMessageDto(saved));
    }

    @PostMapping("/dm/{userId}")
    @PreAuthorize("hasAnyRole('ORGANIZER','TEAM_MEMBER','ADMIN','VENDOR')")
    public ResponseEntity<ChatMessageDto> sendDirectMessage(@PathVariable Integer userId,
                                                            @RequestBody SendMessageRequest request,
                                                            Authentication authentication) {
        DirectMessage saved = chatService.sendDirectMessage(authentication.getName(), userId, request.getMessageText());
        return ResponseEntity.ok(toDirectMessageDto(saved));
    }

    private ChatEventDto toEventDto(Event event) {
        ChatEventDto dto = new ChatEventDto();
        dto.eventId = event.getEventId();
        dto.eventName = event.getEventName();
        dto.eventType = event.getEventType();
        dto.eventDate = event.getEventDate();
        dto.venue = event.getVenue();
        return dto;
    }

    private ChatMemberDto toMemberDto(User user) {
        ChatMemberDto dto = new ChatMemberDto();
        dto.userId = user.getUserId();
        dto.name = user.getName();
        dto.email = user.getEmail();
        dto.role = user.getRole();
        return dto;
    }

    private GroupConversationDto toGroupConversationDto(ChatService.GroupConversation conversation) {
        GroupConversationDto dto = new GroupConversationDto();
        dto.eventId = conversation.eventId();
        dto.eventName = conversation.eventName();
        dto.eventType = conversation.eventType();
        dto.eventDate = conversation.eventDate();
        dto.venue = conversation.venue();
        dto.lastMessage = conversation.lastMessage();
        dto.lastActivityAt = conversation.lastActivityAt();
        dto.participantCount = conversation.participantCount();
        return dto;
    }

    private DirectConversationDto toDirectConversationDto(ChatService.DirectConversation conversation) {
        DirectConversationDto dto = new DirectConversationDto();
        dto.otherUser = toMemberDto(conversation.otherUser());
        dto.lastMessage = conversation.lastMessage();
        dto.lastActivityAt = conversation.lastActivityAt();
        dto.lastSenderId = conversation.lastSenderId();
        return dto;
    }

    private ChatMessageDto toGroupMessageDto(Message message) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.messageId = message.getMessageId();
        dto.senderId = message.getSender() != null ? message.getSender().getUserId() : null;
        dto.senderName = message.getSender() != null ? message.getSender().getName() : null;
        dto.senderEmail = message.getSender() != null ? message.getSender().getEmail() : null;
        dto.messageText = message.getMessageText();
        dto.sentAt = message.getSentAt();
        return dto;
    }

    private ChatMessageDto toDirectMessageDto(DirectMessage message) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.messageId = message.getDmId();
        dto.senderId = message.getSender() != null ? message.getSender().getUserId() : null;
        dto.senderName = message.getSender() != null ? message.getSender().getName() : null;
        dto.senderEmail = message.getSender() != null ? message.getSender().getEmail() : null;
        dto.receiverId = message.getReceiver() != null ? message.getReceiver().getUserId() : null;
        dto.messageText = message.getMessageText();
        dto.sentAt = message.getSentAt();
        return dto;
    }

    public static class SendMessageRequest {
        private String messageText;

        public String getMessageText() { return messageText; }
        public void setMessageText(String messageText) { this.messageText = messageText; }
    }

    public static class ChatEventDto {
        public Integer eventId;
        public String eventName;
        public String eventType;
        public LocalDate eventDate;
        public String venue;
    }

    public static class ChatMemberDto {
        public Integer userId;
        public String name;
        public String email;
        public String role;
    }

    public static class GroupConversationDto {
        public Integer eventId;
        public String eventName;
        public String eventType;
        public LocalDate eventDate;
        public String venue;
        public String lastMessage;
        public LocalDateTime lastActivityAt;
        public Integer participantCount;
    }

    public static class DirectConversationDto {
        public ChatMemberDto otherUser;
        public String lastMessage;
        public LocalDateTime lastActivityAt;
        public Integer lastSenderId;
    }

    public static class ChatInboxDto {
        public List<GroupConversationDto> groups;
        public List<DirectConversationDto> directMessages;
        public List<ChatMemberDto> contacts;
    }

    public static class ChatMessageDto {
        public Integer messageId;
        public Integer senderId;
        public String senderName;
        public String senderEmail;
        public Integer receiverId;
        public String messageText;
        public LocalDateTime sentAt;
    }
}
