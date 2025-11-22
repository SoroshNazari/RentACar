package com.rentacar.booking.domain.model;

import com.rentacar.inventory.domain.model.VehicleType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "price_configuration")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
/**
 * Konfigurationsklasse.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class PriceConfiguration {

    @Id
    @Enumerated(EnumType.STRING)
    private VehicleType vehicleType;

    @Column(nullable = false)
    private BigDecimal dailyRate;
}
