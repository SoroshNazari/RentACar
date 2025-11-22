package com.rentacar.inventory.domain.model;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleTest {

    @Test
    void builder_shouldCreateVehicle() {
        // When
        Vehicle vehicle = Vehicle.builder()
                .licensePlate("AB-CD-1234")
                .vin("WBA12345678901234")
                .type(VehicleType.LIMOUSINE)
                .brand("BMW")
                .model("3er")
                .mileage(15000)
                .status(VehicleStatus.VERFUEGBAR)
                .build();

        // Then
        assertThat(vehicle.getLicensePlate()).isEqualTo("AB-CD-1234");
        assertThat(vehicle.getVin()).isEqualTo("WBA12345678901234");
        assertThat(vehicle.getType()).isEqualTo(VehicleType.LIMOUSINE);
        assertThat(vehicle.getBrand()).isEqualTo("BMW");
        assertThat(vehicle.getModel()).isEqualTo("3er");
        assertThat(vehicle.getMileage()).isEqualTo(15000);
        assertThat(vehicle.getStatus()).isEqualTo(VehicleStatus.VERFUEGBAR);
    }

    @Test
    void settersAndGetters_shouldWork() {
        // Given
        Vehicle vehicle = new Vehicle();
        UUID id = UUID.randomUUID();

        // When
        vehicle.setId(id);
        vehicle.setLicensePlate("XY-ZZ-9999");
        vehicle.setStatus(VehicleStatus.WARTUNG);
        vehicle.setMileage(25000);
        vehicle.setVin("TEST123456789");

        // Then
        assertThat(vehicle.getId()).isEqualTo(id);
        assertThat(vehicle.getLicensePlate()).isEqualTo("XY-ZZ-9999");
        assertThat(vehicle.getStatus()).isEqualTo(VehicleStatus.WARTUNG);
        assertThat(vehicle.getMileage()).isEqualTo(25000);
        assertThat(vehicle.getVin()).isEqualTo("TEST123456789");
    }
}
