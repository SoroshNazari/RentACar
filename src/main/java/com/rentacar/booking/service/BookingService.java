package com.rentacar.booking.service;

import com.rentacar.booking.domain.model.Booking;
import com.rentacar.booking.domain.model.BookingStatus;
import com.rentacar.booking.domain.model.PriceConfiguration;
import com.rentacar.booking.repository.BookingRepository;
import com.rentacar.booking.repository.PriceConfigurationRepository;
import com.rentacar.infrastructure.audit.AuditLogEvent;
import com.rentacar.inventory.domain.model.Vehicle;
import com.rentacar.inventory.domain.model.VehicleType;
import com.rentacar.inventory.service.VehicleService;
import jakarta.persistence.EntityNotFoundException;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
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
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PriceConfigurationRepository priceConfigurationRepository;
    private final VehicleService vehicleService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<Vehicle> searchVehicles(LocalDateTime from, LocalDateTime to, VehicleType type) {
        List<UUID> bookedVehicleIds = bookingRepository.findBookedVehicleIds(BookingStatus.BESTAETIGT, from, to);
        return vehicleService.findAvailableVehicles(type, bookedVehicleIds);
    }

    @Transactional
    public Booking createBooking(UUID customerId, UUID vehicleId, UUID pickupBranchId, UUID returnBranchId,
            LocalDateTime start, LocalDateTime end) {
        // 1. Validate availability (Race Condition Check)
        List<UUID> bookedVehicleIds = bookingRepository.findBookedVehicleIds(BookingStatus.BESTAETIGT, start, end);
        if (bookedVehicleIds.contains(vehicleId)) {
            throw new IllegalStateException("Vehicle is not available for the selected period.");
        }

        Vehicle vehicle = vehicleService.getVehicle(vehicleId);

        // 2. Calculate Price
        long days = Duration.between(start, end).toDays();
        if (days < 1)
            days = 1; // Minimum 1 day

        @NonNull
        PriceConfiguration priceConfig = priceConfigurationRepository.findById(vehicle.getType())
                .orElseThrow(
                        () -> new IllegalStateException("Price configuration missing for type: " + vehicle.getType()));

        BigDecimal totalPrice = priceConfig.getDailyRate().multiply(BigDecimal.valueOf(days));

        // 3. Create Booking
        Booking booking = Booking.builder()
                .customerId(customerId)
                .vehicleId(vehicleId)
                .pickupBranchId(pickupBranchId)
                .returnBranchId(returnBranchId)
                .startTime(start)
                .endTime(end)
                .status(BookingStatus.BESTAETIGT) // Directly confirmed as per requirements (UC-2)
                .totalPrice(totalPrice)
                .build();

        @NonNull
        Booking saved = bookingRepository.save(booking);
        eventPublisher.publishEvent(new AuditLogEvent(this, "CUSTOMER", "CREATE_BOOKING", saved.getId()));
        return saved;
    }

    @Transactional
    public void cancelBooking(UUID bookingId) {
        @NonNull
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (LocalDateTime.now().plusHours(24).isAfter(booking.getStartTime())) {
            throw new IllegalStateException("Cancellation period expired (must be > 24h before start)");
        }

        booking.setStatus(BookingStatus.STORNIERT);
        bookingRepository.save(booking);
        eventPublisher.publishEvent(new AuditLogEvent(this, "CUSTOMER", "CANCEL_BOOKING", booking.getId()));
    }
}
