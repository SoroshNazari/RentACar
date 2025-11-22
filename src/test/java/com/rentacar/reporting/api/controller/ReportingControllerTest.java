package com.rentacar.reporting.api.controller;

import com.rentacar.reporting.dto.ReportingStats;
import com.rentacar.reporting.service.ReportingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReportingController.class)
@AutoConfigureMockMvc(addFilters = false)
class ReportingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportingService reportingService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void getOverallStats_shouldReturnStats() throws Exception {
        // Given
        ReportingStats stats = new ReportingStats();
        stats.setTotalVehicles(50L);
        stats.setAvailableVehicles(35L);
        stats.setActiveBookings(10L);
        stats.setTotalRevenue(new BigDecimal("15000.00"));
        stats.setTotalCustomers(120L);

        when(reportingService.getOverallStats()).thenReturn(stats);

        // When & Then
        mockMvc.perform(get("/api/v1/reports/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalVehicles").value(50))
                .andExpect(jsonPath("$.availableVehicles").value(35))
                .andExpect(jsonPath("$.activeBookings").value(10))
                .andExpect(jsonPath("$.totalRevenue").value(15000.00))
                .andExpect(jsonPath("$.totalCustomers").value(120));
    }
}
