package com.rentacar.inventory.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "vehicle")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
/**
 * Domain-Klasse für Vehicle.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String licensePlate;

    @Column(unique = true, nullable = false)
    private String vin;

    private String brand;

    private String model;

    @Enumerated(EnumType.STRING)
    private VehicleType type;

    @Enumerated(EnumType.STRING)
    private VehicleStatus status;

    private Integer mileage;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Branch location;

    @Version
    private Long version;
}
