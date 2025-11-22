package com.rentacar.inventory.service;

import com.rentacar.infrastructure.audit.AuditLogEvent;
import com.rentacar.inventory.domain.model.Vehicle;
import com.rentacar.inventory.domain.model.VehicleStatus;
import com.rentacar.inventory.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
/**
 * Service-Klasse für Business-Logik.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public @NonNull Vehicle createVehicle(@NonNull Vehicle vehicle) {
        // Basic validation could go here
        @NonNull
        Vehicle saved = vehicleRepository.save(vehicle);
        eventPublisher.publishEvent(new AuditLogEvent(this, "EMPLOYEE", "CREATE_VEHICLE", saved.getId()));
        return saved;
    }

    @Transactional
    public @NonNull Vehicle updateVehicleStatus(@NonNull UUID id, @NonNull VehicleStatus status) {
        @NonNull
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));

        vehicle.setStatus(status);
        @NonNull
        Vehicle saved = vehicleRepository.save(vehicle);
        eventPublisher.publishEvent(new AuditLogEvent(this, "EMPLOYEE", "UPDATE_VEHICLE_STATUS", saved.getId()));
        return saved;
    }

    public @NonNull Vehicle getVehicle(@NonNull UUID id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));
    }

    public java.util.List<Vehicle> findAvailableVehicles(com.rentacar.inventory.domain.model.VehicleType type,
            java.util.List<UUID> excludedIds) {
        if (excludedIds == null || excludedIds.isEmpty()) {
            return vehicleRepository.findAvailableVehiclesNoExclusion(type, VehicleStatus.VERFUEGBAR);
        }
        return vehicleRepository.findAvailableVehicles(type, VehicleStatus.VERFUEGBAR, excludedIds);
    }
}
