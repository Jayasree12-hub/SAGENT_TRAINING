package com.eventapp.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user")
@Data @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;
    private String name;
    @Column(unique = true)
    private String email;
    private String phone;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private String role;
    private String specialization;
    private LocalDateTime createdAt;
    private Boolean isVerified;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String otpCode;
    private LocalDateTime otpExpiresAt;
}
