package com.eventapp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "budget")
@Data @NoArgsConstructor @AllArgsConstructor
public class Budget {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer budgetId;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    private String category;
    private BigDecimal estimatedAmount;
    private BigDecimal actualAmount;
    private String notes;
}
