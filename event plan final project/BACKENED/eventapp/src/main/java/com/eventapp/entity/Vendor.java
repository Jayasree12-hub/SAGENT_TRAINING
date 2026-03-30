package com.eventapp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "vendor")
@Data @NoArgsConstructor @AllArgsConstructor
public class Vendor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer vendorId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String businessName;
    private String serviceType;
    private BigDecimal startingPrice;
    private Float rating;
    @Column(columnDefinition = "TEXT")
    private String aboutBusiness;
    @Column(columnDefinition = "TEXT")
    private String businessDetails;
    @Column(columnDefinition = "TEXT")
    private String photoUrl;
}
