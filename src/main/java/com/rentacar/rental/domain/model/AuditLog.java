package com.rentacar.rental.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
/**
 * Domain-Klasse für AuditLog.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String actor;

    private String action;

    private UUID entityId;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
