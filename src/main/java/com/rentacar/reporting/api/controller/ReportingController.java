package com.rentacar.reporting.api.controller;

import com.rentacar.reporting.dto.ReportingStats;
import com.rentacar.reporting.service.ReportingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for reporting and statistics.
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Reporting and Statistics API")
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Get overall statistics", description = "Returns overall system statistics including vehicles, bookings, revenue, and customers")
    public ReportingStats getOverallStats() {
        return reportingService.getOverallStats();
    }
}
