package com.rentacar.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for reporting statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
/**
 * Domain-Klasse für ReportingStats.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class ReportingStats {

    // Vehicle Statistics
    private Long totalVehicles;
    private Long availableVehicles;
    private Long rentedVehicles;
    private Long maintenanceVehicles;

    // Booking Statistics
    private Long totalBookings;
    private Long activeBookings;
    private Long completedBookings;
    private Long cancelledBookings;

    // Revenue Statistics
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal averageBookingValue;

    // Customer Statistics
    private Long totalCustomers;
    private Long activeCustomers;
}
