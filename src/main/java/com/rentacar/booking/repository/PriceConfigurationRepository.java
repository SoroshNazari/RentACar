package com.rentacar.booking.repository;

import com.rentacar.booking.domain.model.PriceConfiguration;
import com.rentacar.inventory.domain.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PriceConfigurationRepository extends JpaRepository<PriceConfiguration, VehicleType> {
}
