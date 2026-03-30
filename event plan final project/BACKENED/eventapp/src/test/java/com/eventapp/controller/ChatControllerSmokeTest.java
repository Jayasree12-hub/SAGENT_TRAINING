package com.eventapp.controller;

import com.eventapp.entity.DirectMessage;
import com.eventapp.entity.Message;
import com.eventapp.entity.User;
import com.eventapp.security.JwtAuthenticationFilter;
import com.eventapp.security.JwtUtil;
import com.eventapp.security.SecurityConfig;
import com.eventapp.service.ChatRealtimeService;
import com.eventapp.service.ChatService;
import com.eventapp.service.EventService;
import com.eventapp.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtUtil.class})
class ChatControllerSmokeTest {

    private static final Integer EVENT_ID = 101;
    private static final Integer ORGANIZER_ID = 11;
    private static final Integer TEAM_MEMBER_ID = 22;
    private static final String ORGANIZER_EMAIL = "organizer@example.com";
    private static final String TEAM_MEMBER_EMAIL = "member@example.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @MockBean
    private ChatService chatService;

    @MockBean
    private ChatRealtimeService chatRealtimeService;

    @MockBean
    private EventService eventService;

    @MockBean
    private UserService userService;

    @Test
    void chatEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/chat/events/{eventId}/group/messages", EVENT_ID))
                .andExpect(status().isForbidden());
    }

    @Test
    void authenticatedUserCanOpenRealtimeChatStream() throws Exception {
        User organizer = user(ORGANIZER_ID, "Organizer", ORGANIZER_EMAIL, "ORGANIZER");
        when(userService.getByEmail(ORGANIZER_EMAIL)).thenReturn(Optional.of(organizer));
        when(chatRealtimeService.subscribe(ORGANIZER_ID)).thenReturn(new SseEmitter());

        mockMvc.perform(get("/api/chat/stream")
                        .param("token", jwtUtil.generateToken(ORGANIZER_EMAIL, "ORGANIZER")))
                .andExpect(status().isOk());

        verify(userService).getByEmail(ORGANIZER_EMAIL);
        verify(chatRealtimeService).subscribe(ORGANIZER_ID);
    }

    @Test
    void organizerAndTeamMemberCanExchangeMessagesThroughSecuredEndpoints() throws Exception {
        User organizer = user(ORGANIZER_ID, "Organizer", ORGANIZER_EMAIL, "ORGANIZER");
        User teamMember = user(TEAM_MEMBER_ID, "Team Member", TEAM_MEMBER_EMAIL, "TEAM_MEMBER");

        Message groupMessage = new Message();
        groupMessage.setMessageId(501);
        groupMessage.setSender(organizer);
        groupMessage.setMessageText("Welcome to the event chat");
        groupMessage.setSentAt(LocalDateTime.of(2026, 3, 25, 15, 0));

        DirectMessage directMessage = new DirectMessage();
        directMessage.setDmId(701);
        directMessage.setSender(teamMember);
        directMessage.setReceiver(organizer);
        directMessage.setMessageText("I am ready for the event");
        directMessage.setSentAt(LocalDateTime.of(2026, 3, 25, 15, 5));

        ChatService.ChatInbox organizerInbox = new ChatService.ChatInbox(
                List.of(new ChatService.GroupConversation(
                        EVENT_ID,
                        "Spring Summit",
                        "Corporate",
                        null,
                        "Main Hall",
                        "Welcome to the event chat",
                        groupMessage.getSentAt(),
                        2
                )),
                List.of(new ChatService.DirectConversation(
                        teamMember,
                        "I am ready for the event",
                        directMessage.getSentAt(),
                        TEAM_MEMBER_ID
                )),
                List.of(organizer, teamMember)
        );

        when(chatService.getInbox(ORGANIZER_EMAIL)).thenReturn(organizerInbox);
        when(chatService.getMembersForEvent(EVENT_ID, ORGANIZER_EMAIL))
                .thenReturn(List.of(organizer, teamMember));
        when(chatService.sendGroupMessage(EVENT_ID, ORGANIZER_EMAIL, "Welcome to the event chat"))
                .thenReturn(groupMessage);
        when(chatService.getGroupMessages(EVENT_ID, TEAM_MEMBER_EMAIL))
                .thenReturn(List.of(groupMessage));
        when(chatService.sendDirectMessage(TEAM_MEMBER_EMAIL, ORGANIZER_ID, "I am ready for the event"))
                .thenReturn(directMessage);
        when(chatService.getDirectMessages(ORGANIZER_EMAIL, TEAM_MEMBER_ID))
                .thenReturn(List.of(directMessage));

        String organizerToken = bearerToken(ORGANIZER_EMAIL, "ORGANIZER");
        String teamMemberToken = bearerToken(TEAM_MEMBER_EMAIL, "TEAM_MEMBER");

        mockMvc.perform(get("/api/chat/events/{eventId}/members", EVENT_ID)
                        .header("Authorization", organizerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value(ORGANIZER_EMAIL))
                .andExpect(jsonPath("$[1].email").value(TEAM_MEMBER_EMAIL))
                .andExpect(jsonPath("$[1].role").value("TEAM_MEMBER"));

        mockMvc.perform(get("/api/chat/inbox")
                        .header("Authorization", organizerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groups[0].eventId").value(EVENT_ID))
                .andExpect(jsonPath("$.groups[0].eventName").value("Spring Summit"))
                .andExpect(jsonPath("$.directMessages[0].otherUser.email").value(TEAM_MEMBER_EMAIL))
                .andExpect(jsonPath("$.contacts[1].email").value(TEAM_MEMBER_EMAIL));

        mockMvc.perform(post("/api/chat/events/{eventId}/group/messages", EVENT_ID)
                        .header("Authorization", organizerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SendMessagePayload("Welcome to the event chat"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.senderEmail").value(ORGANIZER_EMAIL))
                .andExpect(jsonPath("$.messageText").value("Welcome to the event chat"));

        mockMvc.perform(get("/api/chat/events/{eventId}/group/messages", EVENT_ID)
                        .header("Authorization", teamMemberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].senderEmail").value(ORGANIZER_EMAIL))
                .andExpect(jsonPath("$[0].messageText").value("Welcome to the event chat"));

        mockMvc.perform(post("/api/chat/dm/{userId}", ORGANIZER_ID)
                        .header("Authorization", teamMemberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SendMessagePayload("I am ready for the event"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.senderEmail").value(TEAM_MEMBER_EMAIL))
                .andExpect(jsonPath("$.receiverId").value(ORGANIZER_ID))
                .andExpect(jsonPath("$.messageText").value("I am ready for the event"));

        mockMvc.perform(get("/api/chat/dm/{userId}", TEAM_MEMBER_ID)
                        .header("Authorization", organizerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].senderEmail").value(TEAM_MEMBER_EMAIL))
                .andExpect(jsonPath("$[0].receiverId").value(ORGANIZER_ID))
                .andExpect(jsonPath("$[0].messageText").value("I am ready for the event"));

        verify(chatService).getInbox(ORGANIZER_EMAIL);
        verify(chatService).getMembersForEvent(EVENT_ID, ORGANIZER_EMAIL);
        verify(chatService).sendGroupMessage(EVENT_ID, ORGANIZER_EMAIL, "Welcome to the event chat");
        verify(chatService).getGroupMessages(EVENT_ID, TEAM_MEMBER_EMAIL);
        verify(chatService).sendDirectMessage(TEAM_MEMBER_EMAIL, ORGANIZER_ID, "I am ready for the event");
        verify(chatService).getDirectMessages(ORGANIZER_EMAIL, TEAM_MEMBER_ID);
    }

    @Test
    void organizerCanDeleteGroupRoomThroughChatEndpoint() throws Exception {
        String organizerToken = bearerToken(ORGANIZER_EMAIL, "ORGANIZER");

        mockMvc.perform(delete("/api/chat/events/{eventId}/group", EVENT_ID)
                        .header("Authorization", organizerToken))
                .andExpect(status().isNoContent());

        verify(eventService).deleteEvent(EVENT_ID, ORGANIZER_EMAIL);
    }

    private String bearerToken(String email, String role) {
        return "Bearer " + jwtUtil.generateToken(email, role);
    }

    private User user(Integer id, String name, String email, String role) {
        User user = new User();
        user.setUserId(id);
        user.setName(name);
        user.setEmail(email);
        user.setRole(role);
        user.setIsVerified(true);
        return user;
    }

    private record SendMessagePayload(String messageText) {}
}
