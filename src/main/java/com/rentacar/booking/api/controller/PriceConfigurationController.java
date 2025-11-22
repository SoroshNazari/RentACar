package com.rentacar.booking.api.controller;

import com.rentacar.booking.api.dto.PriceConfigurationDto;
import com.rentacar.booking.domain.model.PriceConfiguration;
import com.rentacar.booking.service.PriceConfigurationService;
import com.rentacar.inventory.domain.model.VehicleType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/price-configurations")
@RequiredArgsConstructor
@Tag(name = "Price Configuration", description = "Admin API für Preiskonfiguration")
/**
 * REST Controller für booking-Verwaltung.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class PriceConfigurationController {

    private final PriceConfigurationService priceConfigurationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Preiskonfiguration anlegen", description = "Nur für ADMIN")
    public PriceConfigurationDto.Response createPriceConfiguration(
            @Valid @RequestBody PriceConfigurationDto.CreateRequest request) {

        PriceConfiguration config = priceConfigurationService.createPriceConfiguration(
                request.getVehicleType(),
                request.getDailyRate());

        return mapToResponse(config);
    }

    @PutMapping("/{vehicleType}")
    @Operation(summary = "Preiskonfiguration aktualisieren", description = "Nur für ADMIN")
    public PriceConfigurationDto.Response updatePriceConfiguration(
            @PathVariable VehicleType vehicleType,
            @Valid @RequestBody PriceConfigurationDto.UpdateRequest request) {

        PriceConfiguration config = priceConfigurationService.updatePriceConfiguration(
                vehicleType,
                request.getDailyRate());

        return mapToResponse(config);
    }

    @GetMapping("/{vehicleType}")
    @Operation(summary = "Preiskonfiguration abrufen")
    public PriceConfigurationDto.Response getPriceConfiguration(@PathVariable VehicleType vehicleType) {
        PriceConfiguration config = priceConfigurationService.getPriceConfiguration(vehicleType);
        return mapToResponse(config);
    }

    @GetMapping
    @Operation(summary = "Alle Preiskonfigurationen abrufen")
    public List<PriceConfigurationDto.Response> getAllPriceConfigurations() {
        return priceConfigurationService.getAllPriceConfigurations().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/{vehicleType}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Preiskonfiguration löschen", description = "Nur für ADMIN")
    public void deletePriceConfiguration(@PathVariable VehicleType vehicleType) {
        priceConfigurationService.deletePriceConfiguration(vehicleType);
    }

    private PriceConfigurationDto.Response mapToResponse(PriceConfiguration config) {
        PriceConfigurationDto.Response response = new PriceConfigurationDto.Response();
        response.setVehicleType(config.getVehicleType());
        response.setDailyRate(config.getDailyRate());
        return response;
    }
}
