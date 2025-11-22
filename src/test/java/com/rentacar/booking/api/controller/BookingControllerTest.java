package com.rentacar.booking.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentacar.booking.api.dto.BookingDto;
import com.rentacar.booking.domain.model.Booking;
import com.rentacar.booking.domain.model.BookingStatus;
import com.rentacar.booking.service.BookingService;
import com.rentacar.inventory.domain.model.Vehicle;
import com.rentacar.inventory.domain.model.VehicleType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookingController.class)
@AutoConfigureMockMvc(addFilters = false)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingService bookingService;

    @Test
    @WithMockUser
    void searchVehicles_shouldReturnAvailableVehicles() throws Exception {
        // Given
        LocalDateTime from = LocalDateTime.now().plusDays(1);
        LocalDateTime to = LocalDateTime.now().plusDays(3);
        VehicleType type = VehicleType.LIMOUSINE;

        Vehicle vehicle = new Vehicle();
        vehicle.setId(UUID.randomUUID());
        vehicle.setLicensePlate("HH-AB-123");
        vehicle.setType(type);

        when(bookingService.searchVehicles(any(LocalDateTime.class), any(LocalDateTime.class), eq(type)))
                .thenReturn(List.of(vehicle));

        // When & Then
        mockMvc.perform(get("/api/v1/bookings/search")
                .param("from", from.toString())
                .param("to", to.toString())
                .param("type", type.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].licensePlate").value("HH-AB-123"));

        verify(bookingService).searchVehicles(any(LocalDateTime.class), any(LocalDateTime.class), eq(type));
    }

    @Test
    @WithMockUser
    void createBooking_shouldReturnCreatedBooking() throws Exception {
        // Given
        UUID customerId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();
        UUID branchId = UUID.randomUUID();
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(3);

        BookingDto.CreateRequest request = new BookingDto.CreateRequest();
        request.setCustomerId(customerId);
        request.setVehicleId(vehicleId);
        request.setPickupBranchId(branchId);
        request.setStart(start);
        request.setEnd(end);

        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setCustomerId(customerId);
        booking.setVehicleId(vehicleId);
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setStatus(BookingStatus.BESTAETIGT);
        booking.setTotalPrice(new BigDecimal("200.00"));

        when(bookingService.createBooking(eq(customerId), eq(vehicleId), eq(branchId), eq(branchId),
                any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(booking);

        // When & Then
        mockMvc.perform(post("/api/v1/bookings")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerId").value(customerId.toString()))
                .andExpect(jsonPath("$.vehicleId").value(vehicleId.toString()))
                .andExpect(jsonPath("$.status").value("BESTAETIGT"))
                .andExpect(jsonPath("$.totalPrice").value(200.00));

        verify(bookingService).createBooking(eq(customerId), eq(vehicleId), eq(branchId), eq(branchId),
                any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    @WithMockUser
    void createBooking_withReturnBranch_shouldUseReturnBranch() throws Exception {
        // Given
        UUID customerId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();
        UUID pickupBranchId = UUID.randomUUID();
        UUID returnBranchId = UUID.randomUUID();
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(3);

        BookingDto.CreateRequest request = new BookingDto.CreateRequest();
        request.setCustomerId(customerId);
        request.setVehicleId(vehicleId);
        request.setPickupBranchId(pickupBranchId);
        request.setReturnBranchId(returnBranchId);
        request.setStart(start);
        request.setEnd(end);

        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setCustomerId(customerId);
        booking.setVehicleId(vehicleId);
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setStatus(BookingStatus.BESTAETIGT);
        booking.setTotalPrice(new BigDecimal("250.00"));

        when(bookingService.createBooking(eq(customerId), eq(vehicleId), eq(pickupBranchId), eq(returnBranchId),
                any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(booking);

        // When & Then
        mockMvc.perform(post("/api/v1/bookings")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalPrice").value(250.00));

        verify(bookingService).createBooking(eq(customerId), eq(vehicleId), eq(pickupBranchId), eq(returnBranchId),
                any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    @WithMockUser
    void cancelBooking_shouldReturnNoContent() throws Exception {
        // Given
        UUID bookingId = UUID.randomUUID();
        doNothing().when(bookingService).cancelBooking(bookingId);

        // When & Then
        mockMvc.perform(delete("/api/v1/bookings/{id}", bookingId)
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(bookingService).cancelBooking(bookingId);
    }
}
