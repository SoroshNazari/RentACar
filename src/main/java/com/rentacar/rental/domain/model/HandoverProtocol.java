package com.rentacar.rental.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "handover_protocol")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandoverProtocol {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID bookingId;

    @Enumerated(EnumType.STRING)
    private HandoverType type;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private Integer mileageRecorded;

    @Column(columnDefinition = "TEXT")
    private String damageDescription;

    private BigDecimal extraCosts;
}
