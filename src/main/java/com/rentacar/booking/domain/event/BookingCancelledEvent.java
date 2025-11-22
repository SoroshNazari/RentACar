package com.rentacar.booking.domain.event;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

/**
 * Event published when a booking is cancelled.
 */
@Data
@AllArgsConstructor
public class BookingCancelledEvent {
    private UUID bookingId;
    private UUID customerId;
}
