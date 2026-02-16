package com.example.admission_system.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appId;

    private LocalDate aDate;
    private String aStatus;

    @ManyToOne
    @JoinColumn(name = "std_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "c_id")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "officer_id")
    private Officer officer;
}
