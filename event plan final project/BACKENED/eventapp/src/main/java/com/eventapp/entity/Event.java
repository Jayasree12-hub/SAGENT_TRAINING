package com.eventapp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "event")
@Data @NoArgsConstructor @AllArgsConstructor
public class Event {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer eventId;

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private User organizer;

    private String eventName;
    private String eventType;
    private LocalDate eventDate;
    private String venue;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String status;
}
