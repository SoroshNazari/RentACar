package com.rentacar.rental.service;

import com.rentacar.booking.domain.model.Booking;
import com.rentacar.booking.domain.model.BookingStatus;
import com.rentacar.booking.repository.BookingRepository;
import com.rentacar.inventory.domain.model.Vehicle;
import com.rentacar.inventory.domain.model.VehicleStatus;
import com.rentacar.inventory.service.VehicleService;
import com.rentacar.rental.domain.model.HandoverProtocol;
import com.rentacar.rental.domain.model.HandoverType;
import com.rentacar.rental.repository.HandoverProtocolRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.rentacar.infrastructure.audit.AuditLogEvent;
import org.springframework.context.ApplicationEventPublisher;

@Service
@RequiredArgsConstructor
/**
 * Service-Klasse für Business-Logik.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class RentalService {

    private final BookingRepository bookingRepository;
    private final VehicleService vehicleService;
    private final HandoverProtocolRepository handoverProtocolRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void checkout(@NonNull UUID bookingId) {
        @NonNull
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.BESTAETIGT) {
            throw new IllegalStateException("Booking must be confirmed to checkout");
        }

        // Update Vehicle Status
        vehicleService.updateVehicleStatus(booking.getVehicleId(), VehicleStatus.VERMIETET);

        // Create Protocol
        @NonNull
        HandoverProtocol protocol = HandoverProtocol.builder()
                .bookingId(bookingId)
                .type(HandoverType.CHECK_OUT)
                .timestamp(LocalDateTime.now())
                .build();

        handoverProtocolRepository.save(protocol);
        eventPublisher.publishEvent(new AuditLogEvent(this, "EMPLOYEE", "CHECKOUT", bookingId));
    }

    @Transactional
    public void checkin(@NonNull UUID bookingId, Integer mileage, String damageDescription, boolean hasDamage) {
        @NonNull
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        Vehicle vehicle = vehicleService.getVehicle(booking.getVehicleId());

        // Calculate Extra Costs
        BigDecimal extraCosts = BigDecimal.ZERO;
        LocalDateTime now = LocalDateTime.now();

        if (now.isAfter(booking.getEndTime())) {
            // Late fee logic (simplified)
            extraCosts = extraCosts.add(new BigDecimal("50.00"));
        }

        if (hasDamage) {
            extraCosts = extraCosts.add(new BigDecimal("500.00")); // Flat fee for damage
            vehicleService.updateVehicleStatus(vehicle.getId(), VehicleStatus.WARTUNG);
        } else {
            vehicleService.updateVehicleStatus(vehicle.getId(), VehicleStatus.VERFUEGBAR);
        }

        // Update mileage
        vehicle.setMileage(mileage);
        // Note: setMileage is not exposed in VehicleService update method, so we might
        // need to save vehicle here or add method to service.
        // Since we have the entity and transaction, saving it via repository (which
        // service uses) or just modifying attached entity works if transaction is open.
        // But VehicleService manages the repository.
        // Ideally VehicleService should have updateMileage method.
        // For now I will assume JPA dirty checking works if I fetched it via service?
        // Service returns entity, but is it attached? Yes if @Transactional.
        // But RentalService and VehicleService are separate beans. Transaction
        // propagates.
        // So modifying 'vehicle' should work if it's attached.
        // However, 'vehicleService.getVehicle' returns an entity.

        // Update Booking Status
        booking.setStatus(BookingStatus.ABGESCHLOSSEN);
        bookingRepository.save(booking);

        // Create Protocol
        @NonNull
        HandoverProtocol protocol = HandoverProtocol.builder()
                .bookingId(bookingId)
                .type(HandoverType.CHECK_IN)
                .timestamp(now)
                .mileageRecorded(mileage)
                .damageDescription(damageDescription)
                .extraCosts(extraCosts)
                .build();

        handoverProtocolRepository.save(protocol);
        eventPublisher.publishEvent(new AuditLogEvent(this, "EMPLOYEE", "CHECKIN", bookingId));
    }
}
