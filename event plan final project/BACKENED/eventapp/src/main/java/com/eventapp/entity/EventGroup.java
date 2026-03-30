package com.eventapp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "event_group")
@Data @NoArgsConstructor @AllArgsConstructor
public class EventGroup {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer groupId;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    private String joinCode;
}
