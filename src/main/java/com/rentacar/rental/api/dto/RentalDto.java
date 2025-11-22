package com.rentacar.rental.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

public class RentalDto {

    @Data
    public static class CheckoutRequest {
        @NotNull
        private UUID bookingId;
    }

    @Data
    public static class CheckinRequest {
        @NotNull
        private UUID bookingId;
        @NotNull
        private Integer mileage;
        private String damageDescription;
        private boolean hasDamage;
    }
}
