package com.eventapp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "group_forum")
@Data @NoArgsConstructor @AllArgsConstructor
public class GroupForum {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer forumId;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private EventGroup group;

    private String forumName;
    private String specialization;
}
