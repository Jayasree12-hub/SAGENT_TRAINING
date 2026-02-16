package com.example.expense_tracker.entity;

//public class Expense {
//}


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;

    private Double amount;

    private LocalDate expenseDate;


    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

}