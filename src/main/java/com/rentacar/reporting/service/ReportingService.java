package com.rentacar.reporting.service;

import com.rentacar.booking.domain.model.Booking;
import com.rentacar.booking.domain.model.BookingStatus;
import com.rentacar.booking.repository.BookingRepository;
import com.rentacar.customer.repository.CustomerRepository;
import com.rentacar.inventory.domain.model.VehicleStatus;
import com.rentacar.inventory.repository.VehicleRepository;
import com.rentacar.reporting.dto.ReportingStats;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * Service for generating reporting statistics.
 */
@Service
@RequiredArgsConstructor
public class ReportingService {

    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;

    public ReportingStats getOverallStats() {
        return ReportingStats.builder()
                // Vehicle stats
                .totalVehicles(vehicleRepository.count())
                .availableVehicles(vehicleRepository.countByStatus(VehicleStatus.VERFUEGBAR))
                .rentedVehicles(vehicleRepository.countByStatus(VehicleStatus.VERMIETET))
                .maintenanceVehicles(vehicleRepository.countByStatus(VehicleStatus.WARTUNG))

                // Booking stats
                .totalBookings(bookingRepository.count())
                .activeBookings(bookingRepository.countByStatus(BookingStatus.BESTAETIGT))
                .completedBookings(bookingRepository.countByStatus(BookingStatus.ABGESCHLOSSEN))
                .cancelledBookings(bookingRepository.countByStatus(BookingStatus.STORNIERT))

                // Revenue stats
                .totalRevenue(calculateTotalRevenue())
                .monthlyRevenue(calculateMonthlyRevenue())
                .averageBookingValue(calculateAverageBookingValue())

                // Customer stats
                .totalCustomers(customerRepository.count())
                .activeCustomers(countActiveCustomers())
                .build();
    }

    private BigDecimal calculateTotalRevenue() {
        List<Booking> completedBookings = bookingRepository.findByStatus(BookingStatus.ABGESCHLOSSEN);
        return completedBookings.stream()
                .map(Booking::getTotalPrice)
                .filter(price -> price != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateMonthlyRevenue() {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        List<Booking> monthlyBookings = bookingRepository.findByStatusAndStartTimeAfter(
                BookingStatus.ABGESCHLOSSEN, startOfMonth.atStartOfDay());
        return monthlyBookings.stream()
                .map(Booking::getTotalPrice)
                .filter(price -> price != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateAverageBookingValue() {
        List<Booking> completedBookings = bookingRepository.findByStatus(BookingStatus.ABGESCHLOSSEN);
        if (completedBookings.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = completedBookings.stream()
                .map(Booking::getTotalPrice)
                .filter(price -> price != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(completedBookings.size()), 2, RoundingMode.HALF_UP);
    }

    private Long countActiveCustomers() {
        // Customers with at least one active booking
        return bookingRepository.findByStatus(BookingStatus.BESTAETIGT).stream()
                .map(Booking::getCustomerId)
                .distinct()
                .count();
    }
}
