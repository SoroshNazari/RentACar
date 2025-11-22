package com.rentacar.booking.domain.event;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

/**
 * Event published when a booking is created.
 */
@Data
@AllArgsConstructor
public class BookingCreatedEvent {
    private UUID bookingId;
    private UUID customerId;
}
