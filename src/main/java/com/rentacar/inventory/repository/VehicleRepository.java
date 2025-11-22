package com.rentacar.inventory.repository;

import com.rentacar.inventory.domain.model.Vehicle;
import com.rentacar.inventory.domain.model.VehicleStatus;
import com.rentacar.inventory.domain.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
        List<Vehicle> findByStatus(VehicleStatus status);

        List<Vehicle> findByTypeAndStatus(VehicleType type, VehicleStatus status);

        List<Vehicle> findByBranchId(UUID branchId);

        Long countByStatus(VehicleStatus status);

        Optional<Vehicle> findByLicensePlate(String licensePlate);

        List<Vehicle> findByVehicleTypeAndStatusAndBranchId(VehicleType vehicleType, VehicleStatus status,
                        UUID branchId);

        @Query("SELECT v FROM Vehicle v WHERE v.type = :type AND v.status = :status AND v.id NOT IN :excludedIds")
        List<Vehicle> findAvailableVehicles(@Param("type") VehicleType type,
                        @Param("status") VehicleStatus status,
                        @Param("excludedIds") List<UUID> excludedIds);

        @Query("SELECT v FROM Vehicle v WHERE v.type = :type AND v.status = :status")
        List<Vehicle> findAvailableVehiclesNoExclusion(@Param("type") VehicleType type,
                        @Param("status") VehicleStatus status);
}
