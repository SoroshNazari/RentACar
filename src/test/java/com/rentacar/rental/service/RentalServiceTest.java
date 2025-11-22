package com.rentacar.rental.service;

import com.rentacar.booking.domain.model.Booking;
import com.rentacar.booking.domain.model.BookingStatus;
import com.rentacar.booking.repository.BookingRepository;
import com.rentacar.infrastructure.audit.AuditLogEvent;
import com.rentacar.inventory.domain.model.Vehicle;
import com.rentacar.inventory.domain.model.VehicleStatus;
import com.rentacar.inventory.service.VehicleService;
import com.rentacar.rental.domain.model.HandoverProtocol;
import com.rentacar.rental.repository.HandoverProtocolRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RentalServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private VehicleService vehicleService;

    @Mock
    private HandoverProtocolRepository handoverProtocolRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private RentalService rentalService;

    @Test
    void checkout_shouldUpdateVehicleStatusAndCreateProtocol() {
        // Given
        UUID bookingId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setVehicleId(vehicleId);
        booking.setStatus(BookingStatus.BESTAETIGT);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(handoverProtocolRepository.save(any(HandoverProtocol.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        rentalService.checkout(bookingId);

        // Then
        verify(vehicleService).updateVehicleStatus(vehicleId, VehicleStatus.VERMIETET);
        verify(handoverProtocolRepository).save(any(HandoverProtocol.class));
        verify(eventPublisher).publishEvent(any(AuditLogEvent.class));
    }

    @Test
    void checkout_whenBookingNotFound_shouldThrowException() {
        // Given
        UUID bookingId = UUID.randomUUID();
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> rentalService.checkout(bookingId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("not found");

        verify(vehicleService, never()).updateVehicleStatus(any(), any());
    }

    @Test
    void checkout_whenBookingNotConfirmed_shouldThrowException() {
        // Given
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setStatus(BookingStatus.RESERVIERT);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        // When & Then
        assertThatThrownBy(() -> rentalService.checkout(bookingId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("must be confirmed");
    }

    @Test
    void checkin_withoutDamage_shouldSetVehicleAvailable() {
        // Given
        UUID bookingId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setVehicleId(vehicleId);
        booking.setEndTime(LocalDateTime.now().plusHours(1));

        Vehicle vehicle = new Vehicle();
        vehicle.setId(vehicleId);
        vehicle.setMileage(10000);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(vehicleService.getVehicle(vehicleId)).thenReturn(vehicle);
        when(bookingRepository.save(booking)).thenReturn(booking);
        when(handoverProtocolRepository.save(any(HandoverProtocol.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        rentalService.checkin(bookingId, 10500, null, false);

        // Then
        verify(vehicleService).updateVehicleStatus(vehicleId, VehicleStatus.VERFUEGBAR);
        verify(bookingRepository).save(booking);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.ABGESCHLOSSEN);

        ArgumentCaptor<HandoverProtocol> protocolCaptor = ArgumentCaptor.forClass(HandoverProtocol.class);
        verify(handoverProtocolRepository).save(protocolCaptor.capture());

        HandoverProtocol protocol = protocolCaptor.getValue();
        assertThat(protocol.getMileageRecorded()).isEqualTo(10500);
        assertThat(protocol.getExtraCosts()).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    void checkin_withDamage_shouldSetVehicleInMaintenance() {
        // Given
        UUID bookingId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setVehicleId(vehicleId);
        booking.setEndTime(LocalDateTime.now().plusHours(1));

        Vehicle vehicle = new Vehicle();
        vehicle.setId(vehicleId);
        vehicle.setMileage(10000);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(vehicleService.getVehicle(vehicleId)).thenReturn(vehicle);
        when(bookingRepository.save(booking)).thenReturn(booking);
        when(handoverProtocolRepository.save(any(HandoverProtocol.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        rentalService.checkin(bookingId, 10500, "Kratzer an der Tür", true);

        // Then
        verify(vehicleService).updateVehicleStatus(vehicleId, VehicleStatus.WARTUNG);

        ArgumentCaptor<HandoverProtocol> protocolCaptor = ArgumentCaptor.forClass(HandoverProtocol.class);
        verify(handoverProtocolRepository).save(protocolCaptor.capture());

        HandoverProtocol protocol = protocolCaptor.getValue();
        assertThat(protocol.getDamageDescription()).isEqualTo("Kratzer an der Tür");
        assertThat(protocol.getExtraCosts()).isEqualByComparingTo(new BigDecimal("500.00"));
    }

    @Test
    void checkin_whenLate_shouldAddLateFee() {
        // Given
        UUID bookingId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setVehicleId(vehicleId);
        booking.setEndTime(LocalDateTime.now().minusHours(2)); // Late return

        Vehicle vehicle = new Vehicle();
        vehicle.setId(vehicleId);
        vehicle.setMileage(10000);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(vehicleService.getVehicle(vehicleId)).thenReturn(vehicle);
        when(bookingRepository.save(booking)).thenReturn(booking);
        when(handoverProtocolRepository.save(any(HandoverProtocol.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        rentalService.checkin(bookingId, 10500, null, false);

        // Then
        ArgumentCaptor<HandoverProtocol> protocolCaptor = ArgumentCaptor.forClass(HandoverProtocol.class);
        verify(handoverProtocolRepository).save(protocolCaptor.capture());

        HandoverProtocol protocol = protocolCaptor.getValue();
        assertThat(protocol.getExtraCosts()).isEqualByComparingTo(new BigDecimal("50.00"));
    }
}
