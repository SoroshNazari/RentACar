package com.rentacar.booking.api.dto;

import com.rentacar.inventory.domain.model.VehicleType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

public class PriceConfigurationDto {

    @Data
    public static class CreateRequest {
        @NotNull
        private VehicleType vehicleType;

        @NotNull
        @Positive
        private BigDecimal dailyRate;
    }

    @Data
    public static class UpdateRequest {
        @NotNull
        @Positive
        private BigDecimal dailyRate;
    }

    @Data
    public static class Response {
        private VehicleType vehicleType;
        private BigDecimal dailyRate;
    }
}
