package com.rentacar.booking.repository;

import com.rentacar.booking.domain.model.PriceConfiguration;
import com.rentacar.inventory.domain.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
/**
 * Repository-Interface für Datenbankzugriff.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public interface PriceConfigurationRepository extends JpaRepository<PriceConfiguration, VehicleType> {
}
