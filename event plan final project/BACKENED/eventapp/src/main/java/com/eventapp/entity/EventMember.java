package com.eventapp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "event_member")
@Data @NoArgsConstructor @AllArgsConstructor
public class EventMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer memberId;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String roleInEvent;
    private String status;
    private String rejectReason;
}
