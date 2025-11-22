package com.rentacar.booking.service;

import com.rentacar.booking.domain.model.PriceConfiguration;
import com.rentacar.booking.repository.PriceConfigurationRepository;
import com.rentacar.inventory.domain.model.VehicleType;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PriceConfigurationService {

    private final PriceConfigurationRepository priceConfigurationRepository;

    @Transactional
    public PriceConfiguration createPriceConfiguration(VehicleType vehicleType, BigDecimal dailyRate) {
        // Prüfen ob bereits eine Konfiguration für diesen Typ existiert
        if (priceConfigurationRepository.findById(vehicleType).isPresent()) {
            throw new IllegalStateException("Preiskonfiguration für Fahrzeugtyp " + vehicleType + " existiert bereits");
        }

        PriceConfiguration config = PriceConfiguration.builder()
                .vehicleType(vehicleType)
                .dailyRate(dailyRate)
                .build();

        return priceConfigurationRepository.save(config);
    }

    @Transactional
    public PriceConfiguration updatePriceConfiguration(VehicleType vehicleType, BigDecimal dailyRate) {
        PriceConfiguration config = priceConfigurationRepository.findById(vehicleType)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Preiskonfiguration für Fahrzeugtyp " + vehicleType + " nicht gefunden"));

        config.setDailyRate(dailyRate);
        return priceConfigurationRepository.save(config);
    }

    @Transactional(readOnly = true)
    public PriceConfiguration getPriceConfiguration(VehicleType vehicleType) {
        return priceConfigurationRepository.findById(vehicleType)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Preiskonfiguration für Fahrzeugtyp " + vehicleType + " nicht gefunden"));
    }

    @Transactional(readOnly = true)
    public List<PriceConfiguration> getAllPriceConfigurations() {
        return priceConfigurationRepository.findAll();
    }

    @Transactional
    public void deletePriceConfiguration(VehicleType vehicleType) {
        if (!priceConfigurationRepository.existsById(vehicleType)) {
            throw new EntityNotFoundException(
                    "Preiskonfiguration für Fahrzeugtyp " + vehicleType + " nicht gefunden");
        }
        priceConfigurationRepository.deleteById(vehicleType);
    }
}
