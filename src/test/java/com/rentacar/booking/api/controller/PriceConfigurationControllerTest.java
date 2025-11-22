package com.rentacar.booking.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentacar.booking.api.dto.PriceConfigurationDto;
import com.rentacar.booking.domain.model.PriceConfiguration;
import com.rentacar.booking.service.PriceConfigurationService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PriceConfigurationController.class)
@AutoConfigureMockMvc(addFilters = false)
class PriceConfigurationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PriceConfigurationService priceConfigurationService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createPriceConfiguration_AsAdmin_Success() throws Exception {
        // Arrange
        PriceConfigurationDto.CreateRequest request = new PriceConfigurationDto.CreateRequest();
        request.setVehicleType(VehicleType.LIMOUSINE);
        request.setDailyRate(new BigDecimal("100.00"));

        PriceConfiguration config = PriceConfiguration.builder()
                .vehicleType(VehicleType.LIMOUSINE)
                .dailyRate(new BigDecimal("100.00"))
                .build();

        when(priceConfigurationService.createPriceConfiguration(any(), any())).thenReturn(config);

        // Act & Assert
        mockMvc.perform(post("/api/v1/admin/price-configurations")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.vehicleType").value("LIMOUSINE"))
                .andExpect(jsonPath("$.dailyRate").value(100.00));

        verify(priceConfigurationService).createPriceConfiguration(VehicleType.LIMOUSINE, new BigDecimal("100.00"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updatePriceConfiguration_Success() throws Exception {
        // Arrange
        PriceConfigurationDto.UpdateRequest request = new PriceConfigurationDto.UpdateRequest();
        request.setDailyRate(new BigDecimal("120.00"));

        PriceConfiguration config = PriceConfiguration.builder()
                .vehicleType(VehicleType.LIMOUSINE)
                .dailyRate(new BigDecimal("120.00"))
                .build();

        when(priceConfigurationService.updatePriceConfiguration(any(), any())).thenReturn(config);

        // Act & Assert
        mockMvc.perform(put("/api/v1/admin/price-configurations/LIMOUSINE")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dailyRate").value(120.00));

        verify(priceConfigurationService).updatePriceConfiguration(VehicleType.LIMOUSINE, new BigDecimal("120.00"));
    }

    @Test
    void getPriceConfiguration_Public_Success() throws Exception {
        // Arrange
        PriceConfiguration config = PriceConfiguration.builder()
                .vehicleType(VehicleType.LIMOUSINE)
                .dailyRate(new BigDecimal("100.00"))
                .build();

        when(priceConfigurationService.getPriceConfiguration(VehicleType.LIMOUSINE)).thenReturn(config);

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/price-configurations/LIMOUSINE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicleType").value("LIMOUSINE"))
                .andExpect(jsonPath("$.dailyRate").value(100.00));
    }

    @Test
    void getAllPriceConfigurations_Public_Success() throws Exception {
        // Arrange
        List<PriceConfiguration> configs = List.of(
                PriceConfiguration.builder()
                        .vehicleType(VehicleType.LIMOUSINE)
                        .dailyRate(new BigDecimal("100.00"))
                        .build(),
                PriceConfiguration.builder()
                        .vehicleType(VehicleType.SUV)
                        .dailyRate(new BigDecimal("150.00"))
                        .build());

        when(priceConfigurationService.getAllPriceConfigurations()).thenReturn(configs);

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/price-configurations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].vehicleType").value("LIMOUSINE"))
                .andExpect(jsonPath("$[1].vehicleType").value("SUV"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deletePriceConfiguration_AsAdmin_Success() throws Exception {
        // Arrange
        doNothing().when(priceConfigurationService).deletePriceConfiguration(VehicleType.LIMOUSINE);

        // Act & Assert
        mockMvc.perform(delete("/api/v1/admin/price-configurations/LIMOUSINE")
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(priceConfigurationService).deletePriceConfiguration(VehicleType.LIMOUSINE);
    }
}
