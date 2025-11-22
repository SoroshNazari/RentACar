package com.rentacar.booking.service;

import com.rentacar.booking.domain.model.Booking;
import com.rentacar.booking.domain.model.BookingStatus;
import com.rentacar.booking.domain.model.PriceConfiguration;
import com.rentacar.booking.repository.BookingRepository;
import com.rentacar.booking.repository.PriceConfigurationRepository;
import com.rentacar.inventory.domain.model.Vehicle;
import com.rentacar.inventory.domain.model.VehicleType;
import com.rentacar.inventory.service.VehicleService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PriceConfigurationRepository priceConfigurationRepository;

    @Mock
    private VehicleService vehicleService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private BookingService bookingService;

    private UUID vehicleId;
    private UUID customerId;
    private UUID branchId;
    private Vehicle vehicle;
    private PriceConfiguration priceConfig;

    @BeforeEach
    void setUp() {
        vehicleId = UUID.randomUUID();
        customerId = UUID.randomUUID();
        branchId = UUID.randomUUID();

        vehicle = Vehicle.builder()
                .id(vehicleId)
                .type(VehicleType.LIMOUSINE)
                .build();

        priceConfig = PriceConfiguration.builder()
                .vehicleType(VehicleType.LIMOUSINE)
                .dailyRate(new BigDecimal("100.00"))
                .build();
    }

    @Test
    void createBooking_Success() {
        // Arrange
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(3);

        when(bookingRepository.findBookedVehicleIds(BookingStatus.BESTAETIGT, start, end)).thenReturn(List.of());
        when(vehicleService.getVehicle(vehicleId)).thenReturn(vehicle);
        when(priceConfigurationRepository.findById(VehicleType.LIMOUSINE))
                .thenReturn(Optional.of(priceConfig));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Booking result = bookingService.createBooking(customerId, vehicleId, branchId, branchId, start, end);

        // Assert
        assertNotNull(result);
        assertEquals(BookingStatus.BESTAETIGT, result.getStatus());
        assertEquals(new BigDecimal("200.00"), result.getTotalPrice()); // 2 days * 100
        verify(bookingRepository).save(any(Booking.class));
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    void createBooking_VehicleNotAvailable_ThrowsException() {
        // Arrange
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(3);

        when(bookingRepository.findBookedVehicleIds(BookingStatus.BESTAETIGT, start, end))
                .thenReturn(List.of(vehicleId));

        // Act & Assert
        assertThrows(IllegalStateException.class,
                () -> bookingService.createBooking(customerId, vehicleId, branchId, branchId, start, end));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_PriceConfigNotFound_ThrowsException() {
        // Arrange
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(3);

        when(bookingRepository.findBookedVehicleIds(BookingStatus.BESTAETIGT, start, end)).thenReturn(List.of());
        when(vehicleService.getVehicle(vehicleId)).thenReturn(vehicle);
        when(priceConfigurationRepository.findById(VehicleType.LIMOUSINE))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalStateException.class,
                () -> bookingService.createBooking(customerId, vehicleId, branchId, branchId, start, end));
    }

    @Test
    void cancelBooking_Success() {
        // Arrange
        UUID bookingId = UUID.randomUUID();
        LocalDateTime futureStart = LocalDateTime.now().plusDays(2);

        Booking booking = Booking.builder()
                .id(bookingId)
                .startTime(futureStart)
                .status(BookingStatus.BESTAETIGT)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        // Act
        bookingService.cancelBooking(bookingId);

        // Assert
        assertEquals(BookingStatus.STORNIERT, booking.getStatus());
        verify(bookingRepository).save(booking);
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    void cancelBooking_TooLate_ThrowsException() {
        // Arrange
        UUID bookingId = UUID.randomUUID();
        LocalDateTime soonStart = LocalDateTime.now().plusHours(12); // Less than 24h

        Booking booking = Booking.builder()
                .id(bookingId)
                .startTime(soonStart)
                .status(BookingStatus.BESTAETIGT)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> bookingService.cancelBooking(bookingId));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void cancelBooking_NotFound_ThrowsException() {
        // Arrange
        UUID bookingId = UUID.randomUUID();
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> bookingService.cancelBooking(bookingId));
    }
}
