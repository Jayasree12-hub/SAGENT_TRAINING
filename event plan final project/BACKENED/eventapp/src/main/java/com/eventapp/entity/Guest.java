package com.eventapp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "guest")
@Data @NoArgsConstructor @AllArgsConstructor
public class Guest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer guestId;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    private String name;
    private String email;
    private String phone;
    private String rsvpStatus;
    private String attendanceStatus;
}
