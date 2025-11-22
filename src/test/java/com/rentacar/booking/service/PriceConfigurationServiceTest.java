package com.rentacar.booking.service;

import com.rentacar.booking.domain.model.PriceConfiguration;
import com.rentacar.booking.repository.PriceConfigurationRepository;
import com.rentacar.inventory.domain.model.VehicleType;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PriceConfigurationServiceTest {

    @Mock
    private PriceConfigurationRepository priceConfigurationRepository;

    @InjectMocks
    private PriceConfigurationService priceConfigurationService;

    @Test
    void createPriceConfiguration_shouldCreateSuccessfully() {
        // Given
        VehicleType type = VehicleType.LIMOUSINE;
        BigDecimal dailyRate = new BigDecimal("100.00");

        PriceConfiguration config = PriceConfiguration.builder()
                .vehicleType(type)
                .dailyRate(dailyRate)
                .build();

        when(priceConfigurationRepository.findById(type)).thenReturn(Optional.empty());
        when(priceConfigurationRepository.save(any(PriceConfiguration.class))).thenReturn(config);

        // When
        PriceConfiguration result = priceConfigurationService.createPriceConfiguration(type, dailyRate);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getVehicleType()).isEqualTo(type);
        assertThat(result.getDailyRate()).isEqualTo(dailyRate);
        verify(priceConfigurationRepository).save(any(PriceConfiguration.class));
    }

    @Test
    void createPriceConfiguration_whenAlreadyExists_shouldThrowException() {
        // Given
        VehicleType type = VehicleType.LIMOUSINE;
        BigDecimal dailyRate = new BigDecimal("100.00");

        PriceConfiguration existing = PriceConfiguration.builder()
                .vehicleType(type)
                .dailyRate(new BigDecimal("90.00"))
                .build();

        when(priceConfigurationRepository.findById(type)).thenReturn(Optional.of(existing));

        // When & Then
        assertThatThrownBy(() -> priceConfigurationService.createPriceConfiguration(type, dailyRate))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("existiert bereits");

        verify(priceConfigurationRepository, never()).save(any());
    }

    @Test
    void updatePriceConfiguration_shouldUpdateSuccessfully() {
        // Given
        VehicleType type = VehicleType.LIMOUSINE;
        BigDecimal newRate = new BigDecimal("120.00");

        PriceConfiguration existing = PriceConfiguration.builder()
                .vehicleType(type)
                .dailyRate(new BigDecimal("100.00"))
                .build();

        when(priceConfigurationRepository.findById(type)).thenReturn(Optional.of(existing));
        when(priceConfigurationRepository.save(existing)).thenReturn(existing);

        // When
        PriceConfiguration result = priceConfigurationService.updatePriceConfiguration(type, newRate);

        // Then
        assertThat(result.getDailyRate()).isEqualTo(newRate);
        verify(priceConfigurationRepository).save(existing);
    }

    @Test
    void updatePriceConfiguration_whenNotFound_shouldThrowException() {
        // Given
        VehicleType type = VehicleType.LIMOUSINE;
        BigDecimal newRate = new BigDecimal("120.00");

        when(priceConfigurationRepository.findById(type)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> priceConfigurationService.updatePriceConfiguration(type, newRate))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("nicht gefunden");
    }

    @Test
    void getPriceConfiguration_shouldReturnConfiguration() {
        // Given
        VehicleType type = VehicleType.LIMOUSINE;
        PriceConfiguration config = PriceConfiguration.builder()
                .vehicleType(type)
                .dailyRate(new BigDecimal("100.00"))
                .build();

        when(priceConfigurationRepository.findById(type)).thenReturn(Optional.of(config));

        // When
        PriceConfiguration result = priceConfigurationService.getPriceConfiguration(type);

        // Then
        assertThat(result).isEqualTo(config);
    }

    @Test
    void getPriceConfiguration_whenNotFound_shouldThrowException() {
        // Given
        VehicleType type = VehicleType.LIMOUSINE;
        when(priceConfigurationRepository.findById(type)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> priceConfigurationService.getPriceConfiguration(type))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void getAllPriceConfigurations_shouldReturnAllConfigurations() {
        // Given
        PriceConfiguration config1 = PriceConfiguration.builder()
                .vehicleType(VehicleType.LIMOUSINE)
                .dailyRate(new BigDecimal("100.00"))
                .build();

        PriceConfiguration config2 = PriceConfiguration.builder()
                .vehicleType(VehicleType.SUV)
                .dailyRate(new BigDecimal("150.00"))
                .build();

        when(priceConfigurationRepository.findAll()).thenReturn(List.of(config1, config2));

        // When
        List<PriceConfiguration> result = priceConfigurationService.getAllPriceConfigurations();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(config1, config2);
    }

    @Test
    void deletePriceConfiguration_shouldDeleteSuccessfully() {
        // Given
        VehicleType type = VehicleType.LIMOUSINE;
        when(priceConfigurationRepository.existsById(type)).thenReturn(true);
        doNothing().when(priceConfigurationRepository).deleteById(type);

        // When
        priceConfigurationService.deletePriceConfiguration(type);

        // Then
        verify(priceConfigurationRepository).deleteById(type);
    }

    @Test
    void deletePriceConfiguration_whenNotFound_shouldThrowException() {
        // Given
        VehicleType type = VehicleType.LIMOUSINE;
        when(priceConfigurationRepository.existsById(type)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> priceConfigurationService.deletePriceConfiguration(type))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("nicht gefunden");

        verify(priceConfigurationRepository, never()).deleteById(any());
    }
}
