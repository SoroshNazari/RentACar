package com.rentacar.inventory.api.dto;

import com.rentacar.inventory.domain.model.VehicleStatus;
import com.rentacar.inventory.domain.model.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * Data Transfer Object.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class VehicleDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String licensePlate;
        @NotBlank
        private String vin;
        @NotBlank
        private String brand;
        @NotBlank
        private String model;
        @NotNull
        private VehicleType type;
        @NotNull
        private Integer mileage;
        @NotNull
        private UUID locationId;
    }

    @Data
    public static class StatusUpdateRequest {
        @NotNull
        private VehicleStatus status;
    }

    @Data
    public static class Response {
        private UUID id;
        private String licensePlate;
        private String vin;
        private String brand;
        private String model;
        private VehicleType type;
        private VehicleStatus status;
        private Integer mileage;
        private UUID locationId;
    }
}
