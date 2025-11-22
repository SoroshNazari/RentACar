package com.rentacar.inventory.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entity representing a vehicle image.
 */
@Entity
@Table(name = "vehicle_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
/**
 * Domain-Klasse für VehicleImage.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class VehicleImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileUrl;

    @Column
    private boolean isPrimary;
}
