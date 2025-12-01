package de.rentacar.booking.domain;

import de.rentacar.vehicle.domain.VehicleType;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PriceCalculationServiceTest {

    private final PriceCalculationService service = new PriceCalculationService();

    @Test
    public void calculatesTotalPriceForMittelklasse() {
        BigDecimal total = service.calculateTotalPrice(
                VehicleType.MITTELKLASSE,
                LocalDate.of(2025, 1, 10),
                LocalDate.of(2025, 1, 12)
        );
        Assertions.assertEquals(0, total.compareTo(new BigDecimal("180.00")));
    }

    @Test
    public void calculateTotalPriceThrowsOnInvalidDates() {
        Assertions.assertThrows(IllegalArgumentException.class, () ->
                service.calculateTotalPrice(
                        VehicleType.KOMPAKTKLASSE,
                        LocalDate.of(2025, 1, 12),
                        LocalDate.of(2025, 1, 10)
                ));
    }

    @Test
    public void calculatesExtrasCostAllOptions() {
        BigDecimal extras = service.calculateExtrasCost(2, true, true, true);
        Assertions.assertEquals(0, extras.compareTo(new BigDecimal("36.00")));
    }

    @Test
    public void calculatesExtraMileageCostBeyondAllowance() {
        BigDecimal cost = service.calculateExtraMileageCost(2, new BigDecimal("10000"), new BigDecimal("10700"));
        Assertions.assertEquals(0, cost.compareTo(new BigDecimal("25.00")));
    }

    @Test
    public void calculatesLateFeeForDelayedReturn() {
        BigDecimal fee = service.calculateLateFee(
                LocalDate.of(2025, 1, 10),
                LocalDateTime.of(2025, 1, 11, 12, 0)
        );
        Assertions.assertEquals(0, fee.compareTo(new BigDecimal("50.00")));
    }

    @Test
    public void noLateFeeWhenReturnedOnTime() {
        BigDecimal fee = service.calculateLateFee(
                LocalDate.of(2025, 1, 10),
                LocalDateTime.of(2025, 1, 10, 12, 0)
        );
        Assertions.assertEquals(BigDecimal.ZERO, fee);
    }
}
