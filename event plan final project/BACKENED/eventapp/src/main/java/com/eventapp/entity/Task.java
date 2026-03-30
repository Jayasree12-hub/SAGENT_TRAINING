package com.eventapp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "task")
@Data @NoArgsConstructor @AllArgsConstructor
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer taskId;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    private LocalDate deadline;
    private String priority;
    private String status;
    @Column(columnDefinition = "TEXT")
    private String rejectionMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
