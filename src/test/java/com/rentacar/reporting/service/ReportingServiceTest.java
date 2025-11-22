package com.rentacar.reporting.service;

import com.rentacar.booking.domain.model.Booking;
import com.rentacar.booking.domain.model.BookingStatus;
import com.rentacar.booking.repository.BookingRepository;
import com.rentacar.customer.repository.CustomerRepository;
import com.rentacar.inventory.domain.model.VehicleStatus;
import com.rentacar.inventory.repository.VehicleRepository;
import com.rentacar.reporting.dto.ReportingStats;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportingServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private ReportingService reportingService;

    @Test
    void getOverallStats_shouldReturnCompleteStatistics() {
        // Given
        when(vehicleRepository.count()).thenReturn(50L);
        when(vehicleRepository.countByStatus(VehicleStatus.VERFUEGBAR)).thenReturn(30L);
        when(vehicleRepository.countByStatus(VehicleStatus.VERMIETET)).thenReturn(15L);
        when(vehicleRepository.countByStatus(VehicleStatus.WARTUNG)).thenReturn(5L);

        when(bookingRepository.count()).thenReturn(100L);
        when(bookingRepository.countByStatus(BookingStatus.BESTAETIGT)).thenReturn(10L);
        when(bookingRepository.countByStatus(BookingStatus.ABGESCHLOSSEN)).thenReturn(80L);
        when(bookingRepository.countByStatus(BookingStatus.STORNIERT)).thenReturn(10L);

        Booking booking1 = createBooking(new BigDecimal("200.00"));
        Booking booking2 = createBooking(new BigDecimal("300.00"));
        Booking booking3 = createBooking(new BigDecimal("150.00"));

        when(bookingRepository.findByStatus(BookingStatus.ABGESCHLOSSEN))
                .thenReturn(List.of(booking1, booking2, booking3));
        when(bookingRepository.findByStatusAndStartTimeAfter(eq(BookingStatus.ABGESCHLOSSEN), any(LocalDateTime.class)))
                .thenReturn(List.of(booking1));

        when(customerRepository.count()).thenReturn(120L);

        // When
        ReportingStats stats = reportingService.getOverallStats();

        // Then
        assertThat(stats.getTotalVehicles()).isEqualTo(50L);
        assertThat(stats.getAvailableVehicles()).isEqualTo(30L);
        assertThat(stats.getRentedVehicles()).isEqualTo(15L);
        assertThat(stats.getMaintenanceVehicles()).isEqualTo(5L);

        assertThat(stats.getTotalBookings()).isEqualTo(100L);
        assertThat(stats.getActiveBookings()).isEqualTo(10L);
        assertThat(stats.getCompletedBookings()).isEqualTo(80L);
        assertThat(stats.getCancelledBookings()).isEqualTo(10L);

        assertThat(stats.getTotalRevenue()).isEqualByComparingTo(new BigDecimal("650.00"));
        assertThat(stats.getMonthlyRevenue()).isEqualByComparingTo(new BigDecimal("200.00"));
        assertThat(stats.getAverageBookingValue()).isEqualByComparingTo(new BigDecimal("216.67"));

        assertThat(stats.getTotalCustomers()).isEqualTo(120L);
        assertThat(stats.getActiveCustomers()).isEqualTo(0L); // No active bookings with distinct customers
    }

    @Test
    void getOverallStats_withNoCompletedBookings_shouldReturnZeroRevenue() {
        // Given
        when(vehicleRepository.count()).thenReturn(10L);
        when(vehicleRepository.countByStatus(any())).thenReturn(0L);
        when(bookingRepository.count()).thenReturn(0L);
        when(bookingRepository.countByStatus(any())).thenReturn(0L);
        when(bookingRepository.findByStatus(BookingStatus.ABGESCHLOSSEN)).thenReturn(List.of());
        when(bookingRepository.findByStatusAndStartTimeAfter(any(), any())).thenReturn(List.of());
        when(customerRepository.count()).thenReturn(0L);

        // When
        ReportingStats stats = reportingService.getOverallStats();

        // Then
        assertThat(stats.getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(stats.getMonthlyRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(stats.getAverageBookingValue()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void getOverallStats_withActiveCustomers_shouldCountDistinctCustomers() {
        // Given
        when(vehicleRepository.count()).thenReturn(10L);
        when(vehicleRepository.countByStatus(any())).thenReturn(0L);
        when(bookingRepository.count()).thenReturn(5L);
        when(bookingRepository.countByStatus(any())).thenReturn(0L);
        when(bookingRepository.findByStatus(BookingStatus.ABGESCHLOSSEN)).thenReturn(List.of());
        when(bookingRepository.findByStatusAndStartTimeAfter(any(), any())).thenReturn(List.of());

        UUID customer1 = UUID.randomUUID();
        UUID customer2 = UUID.randomUUID();

        Booking activeBooking1 = createBooking(new BigDecimal("100.00"));
        activeBooking1.setCustomerId(customer1);

        Booking activeBooking2 = createBooking(new BigDecimal("150.00"));
        activeBooking2.setCustomerId(customer1); // Same customer

        Booking activeBooking3 = createBooking(new BigDecimal("200.00"));
        activeBooking3.setCustomerId(customer2); // Different customer

        when(bookingRepository.findByStatus(BookingStatus.BESTAETIGT))
                .thenReturn(List.of(activeBooking1, activeBooking2, activeBooking3));
        when(customerRepository.count()).thenReturn(50L);

        // When
        ReportingStats stats = reportingService.getOverallStats();

        // Then
        assertThat(stats.getActiveCustomers()).isEqualTo(2L); // 2 distinct customers
    }

    private Booking createBooking(BigDecimal totalPrice) {
        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.ABGESCHLOSSEN);
        booking.setStartTime(LocalDateTime.now());
        return booking;
    }
}
