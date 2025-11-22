package com.rentacar.inventory.api.controller;

import com.rentacar.inventory.api.dto.VehicleDto;
import com.rentacar.inventory.domain.model.Branch;
import com.rentacar.inventory.domain.model.Vehicle;
import com.rentacar.inventory.domain.model.VehicleStatus;
import com.rentacar.inventory.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/vehicles")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Vehicle Management API")
public class InventoryController {

    private final VehicleService vehicleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new vehicle")
    public VehicleDto.Response createVehicle(@Valid @RequestBody VehicleDto.CreateRequest request) {
        Vehicle vehicle = Vehicle.builder()
                .licensePlate(request.getLicensePlate())
                .vin(request.getVin())
                .brand(request.getBrand())
                .model(request.getModel())
                .type(request.getType())
                .status(VehicleStatus.VERFUEGBAR)
                .mileage(request.getMileage())
                .location(Branch.builder().id(request.getLocationId()).build()) // Assuming ID exists or handled by
                                                                                // service
                .build();

        Vehicle saved = vehicleService.createVehicle(vehicle);
        return mapToResponse(saved);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update vehicle status")
    public VehicleDto.Response updateStatus(@PathVariable UUID id,
            @Valid @RequestBody VehicleDto.StatusUpdateRequest request) {
        Vehicle updated = vehicleService.updateVehicleStatus(id, request.getStatus());
        return mapToResponse(updated);
    }

    private VehicleDto.Response mapToResponse(Vehicle vehicle) {
        VehicleDto.Response response = new VehicleDto.Response();
        response.setId(vehicle.getId());
        response.setLicensePlate(vehicle.getLicensePlate());
        response.setVin(vehicle.getVin());
        response.setBrand(vehicle.getBrand());
        response.setModel(vehicle.getModel());
        response.setType(vehicle.getType());
        response.setStatus(vehicle.getStatus());
        response.setMileage(vehicle.getMileage());
        if (vehicle.getLocation() != null) {
            response.setLocationId(vehicle.getLocation().getId());
        }
        return response;
    }
}
