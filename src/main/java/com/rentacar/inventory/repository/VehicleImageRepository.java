package com.rentacar.inventory.repository;

import com.rentacar.inventory.domain.model.VehicleImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleImageRepository extends JpaRepository<VehicleImage, UUID> {
    List<VehicleImage> findByVehicleId(UUID vehicleId);

    void deleteByVehicleId(UUID vehicleId);
}
