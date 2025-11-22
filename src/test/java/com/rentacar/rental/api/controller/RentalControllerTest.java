package com.rentacar.rental.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentacar.rental.api.dto.RentalDto;
import com.rentacar.rental.service.RentalService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RentalController.class)
@AutoConfigureMockMvc(addFilters = false)
class RentalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RentalService rentalService;

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void checkout_shouldCallServiceAndReturnOk() throws Exception {
        // Given
        UUID bookingId = UUID.randomUUID();
        RentalDto.CheckoutRequest request = new RentalDto.CheckoutRequest();
        request.setBookingId(bookingId);

        doNothing().when(rentalService).checkout(bookingId);

        // When & Then
        mockMvc.perform(post("/api/v1/rentals/checkout")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(rentalService).checkout(bookingId);
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void checkin_shouldCallServiceAndReturnOk() throws Exception {
        // Given
        UUID bookingId = UUID.randomUUID();
        RentalDto.CheckinRequest request = new RentalDto.CheckinRequest();
        request.setBookingId(bookingId);
        request.setMileage(15000);
        request.setHasDamage(false);

        doNothing().when(rentalService).checkin(bookingId, 15000, null, false);

        // When & Then
        mockMvc.perform(post("/api/v1/rentals/checkin")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(rentalService).checkin(bookingId, 15000, null, false);
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void checkin_withDamage_shouldCallServiceWithDamageDescription() throws Exception {
        // Given
        UUID bookingId = UUID.randomUUID();
        RentalDto.CheckinRequest request = new RentalDto.CheckinRequest();
        request.setBookingId(bookingId);
        request.setMileage(15500);
        request.setHasDamage(true);
        request.setDamageDescription("Kratzer an der Tür");

        doNothing().when(rentalService).checkin(bookingId, 15500, "Kratzer an der Tür", true);

        // When & Then
        mockMvc.perform(post("/api/v1/rentals/checkin")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(rentalService).checkin(bookingId, 15500, "Kratzer an der Tür", true);
    }
}
