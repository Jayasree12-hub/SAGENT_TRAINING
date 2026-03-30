package com.eventapp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "event_vendor")
@Data @NoArgsConstructor @AllArgsConstructor
public class EventVendor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer eventVendorId;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    private BigDecimal agreedPrice;
    private String contractStatus;
    private String paymentStatus;
}
