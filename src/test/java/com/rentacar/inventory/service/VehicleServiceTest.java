package com.rentacar.inventory.service;

import com.rentacar.infrastructure.audit.AuditLogEvent;
import com.rentacar.inventory.domain.model.Vehicle;
import com.rentacar.inventory.domain.model.VehicleStatus;
import com.rentacar.inventory.domain.model.VehicleType;
import com.rentacar.inventory.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle vehicle;
    private UUID vehicleId;

    @BeforeEach
    void setUp() {
        vehicleId = UUID.randomUUID();
        vehicle = Vehicle.builder()
                .id(vehicleId)
                .licensePlate("HH-AB-123")
                .vin("VIN123456789")
                .brand("BMW")
                .model("320i")
                .type(VehicleType.LIMOUSINE)
                .status(VehicleStatus.VERFUEGBAR)
                .mileage(1000)
                .build();
    }

    @Test
    void createVehicle_Success() {
        // Arrange
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        // Act
        Vehicle result = vehicleService.createVehicle(vehicle);

        // Assert
        assertNotNull(result);
        assertEquals("HH-AB-123", result.getLicensePlate());
        verify(vehicleRepository).save(vehicle);
        verify(eventPublisher).publishEvent(any(AuditLogEvent.class));
    }

    @Test
    void updateVehicleStatus_Success() {
        // Arrange
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        // Act
        Vehicle result = vehicleService.updateVehicleStatus(vehicleId, VehicleStatus.VERMIETET);

        // Assert
        assertNotNull(result);
        assertEquals(VehicleStatus.VERMIETET, result.getStatus());
        verify(vehicleRepository).save(vehicle);
        verify(eventPublisher).publishEvent(any(AuditLogEvent.class));
    }

    @Test
    void updateVehicleStatus_NotFound_ThrowsException() {
        // Arrange
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class,
                () -> vehicleService.updateVehicleStatus(vehicleId, VehicleStatus.VERMIETET));
        verify(vehicleRepository, never()).save(any());
    }

    @Test
    void getVehicle_Success() {
        // Arrange
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));

        // Act
        Vehicle result = vehicleService.getVehicle(vehicleId);

        // Assert
        assertNotNull(result);
        assertEquals(vehicleId, result.getId());
        assertEquals("BMW", result.getBrand());
    }

    @Test
    void getVehicle_NotFound_ThrowsException() {
        // Arrange
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> vehicleService.getVehicle(vehicleId));
    }

    @Test
    void findAvailableVehicles_WithExclusions() {
        // Arrange
        List<UUID> excludedIds = List.of(UUID.randomUUID());
        when(vehicleRepository.findAvailableVehicles(VehicleType.LIMOUSINE, VehicleStatus.VERFUEGBAR, excludedIds))
                .thenReturn(List.of(vehicle));

        // Act
        List<Vehicle> result = vehicleService.findAvailableVehicles(VehicleType.LIMOUSINE, excludedIds);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(vehicleId, result.get(0).getId());
    }

    @Test
    void findAvailableVehicles_NoExclusions() {
        // Arrange
        when(vehicleRepository.findAvailableVehiclesNoExclusion(VehicleType.LIMOUSINE, VehicleStatus.VERFUEGBAR))
                .thenReturn(List.of(vehicle));

        // Act
        List<Vehicle> result = vehicleService.findAvailableVehicles(VehicleType.LIMOUSINE, List.of());

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(vehicleRepository).findAvailableVehiclesNoExclusion(VehicleType.LIMOUSINE, VehicleStatus.VERFUEGBAR);
    }
}
