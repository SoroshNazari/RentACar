package com.rentacar.booking.api.dto;

import com.rentacar.booking.domain.model.BookingStatus;
import com.rentacar.inventory.domain.model.VehicleType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Data Transfer Object.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class BookingDto {

    @Data
    public static class SearchRequest {
        @NotNull
        @Future
        private LocalDateTime from;
        @NotNull
        @Future
        private LocalDateTime to;
        @NotNull
        private VehicleType type;
        private UUID stationId; // Optional filter
    }

    @Data
    public static class CreateRequest {
        @NotNull
        private UUID vehicleId;
        @NotNull
        private UUID customerId;
        @NotNull
        private UUID pickupBranchId;
        private UUID returnBranchId; // Optional, defaults to pickup
        @NotNull
        @Future
        private LocalDateTime start;
        @NotNull
        @Future
        private LocalDateTime end;
    }

    @Data
    public static class Response {
        private UUID id;
        private UUID customerId;
        private UUID vehicleId;
        private LocalDateTime start;
        private LocalDateTime end;
        private BookingStatus status;
        private BigDecimal totalPrice;
    }
}
