package com.rentacar.inventory.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentacar.inventory.api.dto.VehicleDto;
import com.rentacar.inventory.domain.model.Branch;
import com.rentacar.inventory.domain.model.Vehicle;
import com.rentacar.inventory.domain.model.VehicleStatus;
import com.rentacar.inventory.domain.model.VehicleType;
import com.rentacar.inventory.service.VehicleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InventoryController.class)
@AutoConfigureMockMvc(addFilters = false)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VehicleService vehicleService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createVehicle_shouldReturnCreatedVehicle() throws Exception {
        // Given
        UUID locationId = UUID.randomUUID();
        VehicleDto.CreateRequest request = new VehicleDto.CreateRequest();
        request.setLicensePlate("HH-AB-123");
        request.setVin("VIN123456789");
        request.setBrand("BMW");
        request.setModel("320i");
        request.setType(VehicleType.LIMOUSINE);
        request.setMileage(5000);
        request.setLocationId(locationId);

        Vehicle vehicle = Vehicle.builder()
                .licensePlate("HH-AB-123")
                .vin("VIN123456789")
                .brand("BMW")
                .model("320i")
                .type(VehicleType.LIMOUSINE)
                .status(VehicleStatus.VERFUEGBAR)
                .mileage(5000)
                .location(Branch.builder().id(locationId).build())
                .build();
        vehicle.setId(UUID.randomUUID());

        when(vehicleService.createVehicle(any(Vehicle.class))).thenReturn(vehicle);

        // When & Then
        mockMvc.perform(post("/api/v1/inventory/vehicles")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.licensePlate").value("HH-AB-123"))
                .andExpect(jsonPath("$.brand").value("BMW"))
                .andExpect(jsonPath("$.model").value("320i"))
                .andExpect(jsonPath("$.type").value("LIMOUSINE"))
                .andExpect(jsonPath("$.status").value("VERFUEGBAR"));
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void updateStatus_shouldReturnUpdatedVehicle() throws Exception {
        // Given
        UUID vehicleId = UUID.randomUUID();
        VehicleDto.StatusUpdateRequest request = new VehicleDto.StatusUpdateRequest();
        request.setStatus(VehicleStatus.WARTUNG);

        Vehicle vehicle = Vehicle.builder()
                .licensePlate("HH-AB-123")
                .vin("VIN123456789")
                .brand("BMW")
                .model("320i")
                .type(VehicleType.LIMOUSINE)
                .status(VehicleStatus.WARTUNG)
                .mileage(5000)
                .build();
        vehicle.setId(vehicleId);

        when(vehicleService.updateVehicleStatus(eq(vehicleId), eq(VehicleStatus.WARTUNG)))
                .thenReturn(vehicle);

        // When & Then
        mockMvc.perform(patch("/api/v1/inventory/vehicles/{id}/status", vehicleId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("WARTUNG"));
    }
}
