package com.eventapp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invitation")
@Data @NoArgsConstructor @AllArgsConstructor
public class Invitation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer invitationId;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "guest_id")
    private Guest guest;

    private String templateName;
    @Column(columnDefinition = "TEXT")
    private String customMessage;
    private LocalDateTime sentAt;
}
