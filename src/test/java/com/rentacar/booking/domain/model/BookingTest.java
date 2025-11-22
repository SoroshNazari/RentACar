package com.rentacar.booking.domain.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class BookingTest {

    @Test
    void builder_shouldCreateBooking() {
        // Given
        UUID customerId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();
        UUID pickupBranchId = UUID.randomUUID();
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusDays(3);
        BigDecimal price = new BigDecimal("300.00");

        // When
        Booking booking = Booking.builder()
                .customerId(customerId)
                .vehicleId(vehicleId)
                .pickupBranchId(pickupBranchId)
                .startTime(start)
                .endTime(end)
                .status(BookingStatus.BESTAETIGT)
                .totalPrice(price)
                .build();

        // Then
        assertThat(booking.getCustomerId()).isEqualTo(customerId);
        assertThat(booking.getVehicleId()).isEqualTo(vehicleId);
        assertThat(booking.getPickupBranchId()).isEqualTo(pickupBranchId);
        assertThat(booking.getStartTime()).isEqualTo(start);
        assertThat(booking.getEndTime()).isEqualTo(end);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.BESTAETIGT);
        assertThat(booking.getTotalPrice()).isEqualByComparingTo(price);
    }

    @Test
    void onCreate_shouldSetCreatedAt() {
        // Given
        Booking booking = new Booking();

        // When
        booking.onCreate();

        // Then
        assertThat(booking.getCreatedAt()).isNotNull();
        assertThat(booking.getCreatedAt()).isBefore(LocalDateTime.now().plusSeconds(1));
    }

    @Test
    void settersAndGetters_shouldWork() {
        // Given
        Booking booking = new Booking();
        UUID id = UUID.randomUUID();
        UUID returnBranchId = UUID.randomUUID();

        // When
        booking.setId(id);
        booking.setReturnBranchId(returnBranchId);
        booking.setStatus(BookingStatus.STORNIERT);

        // Then
        assertThat(booking.getId()).isEqualTo(id);
        assertThat(booking.getReturnBranchId()).isEqualTo(returnBranchId);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.STORNIERT);
    }
}
