package de.rentacar.booking.domain;

import de.rentacar.vehicle.domain.VehicleType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Domain Service für Preisberechnung
 */
@Service
public class PriceCalculationService {

    private static final BigDecimal BASE_PRICE_KLEINWAGEN = BigDecimal.valueOf(30.00);
    private static final BigDecimal BASE_PRICE_KOMPAKTKLASSE = BigDecimal.valueOf(40.00);
    private static final BigDecimal BASE_PRICE_MITTELKLASSE = BigDecimal.valueOf(60.00);
    private static final BigDecimal BASE_PRICE_OBERKLASSE = BigDecimal.valueOf(100.00);
    private static final BigDecimal BASE_PRICE_SUV = BigDecimal.valueOf(80.00);
    private static final BigDecimal BASE_PRICE_VAN = BigDecimal.valueOf(70.00);
    private static final BigDecimal BASE_PRICE_SPORTWAGEN = BigDecimal.valueOf(150.00);

    private static final BigDecimal EXTRA_INSURANCE_PER_DAY = BigDecimal.valueOf(10.00);
    private static final BigDecimal EXTRA_ADDITIONAL_DRIVER_PER_DAY = BigDecimal.valueOf(5.00);
    private static final BigDecimal EXTRA_CHILD_SEAT_PER_DAY = BigDecimal.valueOf(3.00);
    private static final long MILEAGE_ALLOWANCE_PER_DAY = 300L;
    private static final BigDecimal EXTRA_MILEAGE_PER_KM = BigDecimal.valueOf(0.25);
    private static final BigDecimal LATE_FEE_PER_DAY = BigDecimal.valueOf(50.00);

    /**
     * Berechnet den Gesamtpreis basierend auf Fahrzeugtyp und Dauer
     */
    public BigDecimal calculateTotalPrice(VehicleType vehicleType, LocalDate pickupDate, LocalDate returnDate) {
        if (pickupDate.isAfter(returnDate)) {
            throw new IllegalArgumentException("Abholdatum muss vor Rückgabedatum liegen");
        }

        long days = ChronoUnit.DAYS.between(pickupDate, returnDate) + 1;
        if (days < 1) {
            throw new IllegalArgumentException("Mindestmietdauer: 1 Tag");
        }

        BigDecimal dailyPrice = getDailyPriceForType(vehicleType);
        return dailyPrice.multiply(BigDecimal.valueOf(days));
    }

    /**
     * Berechnet Zusatzkosten (Versicherung, Zusatzfahrer, Kindersitz) basierend auf Mietdauer.
     * Warum: Zusatzleistungen sollen transparent und konsistent bepreist werden, getrennt vom Basispreis.
     */
    public BigDecimal calculateExtrasCost(long days, boolean insurance, boolean additionalDriver, boolean childSeat) {
        if (days < 1) {
            throw new IllegalArgumentException("Mindestmietdauer: 1 Tag");
        }
        BigDecimal extras = BigDecimal.ZERO;
        if (insurance) extras = extras.add(EXTRA_INSURANCE_PER_DAY.multiply(BigDecimal.valueOf(days)));
        if (additionalDriver) extras = extras.add(EXTRA_ADDITIONAL_DRIVER_PER_DAY.multiply(BigDecimal.valueOf(days)));
        if (childSeat) extras = extras.add(EXTRA_CHILD_SEAT_PER_DAY.multiply(BigDecimal.valueOf(days)));
        return extras;
    }

    public BigDecimal calculateExtraMileageCost(long days, BigDecimal checkoutMileage, BigDecimal checkinMileage) {
        if (checkoutMileage == null || checkinMileage == null) return BigDecimal.ZERO;
        BigDecimal driven = checkinMileage.subtract(checkoutMileage);
        if (driven.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        long allowance = MILEAGE_ALLOWANCE_PER_DAY * days;
        BigDecimal excess = driven.subtract(BigDecimal.valueOf(allowance));
        if (excess.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        return excess.multiply(EXTRA_MILEAGE_PER_KM);
    }

    public BigDecimal calculateLateFee(LocalDate plannedReturnDate, java.time.LocalDateTime actualReturnTime) {
        if (plannedReturnDate == null || actualReturnTime == null) return BigDecimal.ZERO;
        java.time.LocalDateTime planned = plannedReturnDate.atTime(23, 59, 59);
        if (!actualReturnTime.isAfter(planned)) return BigDecimal.ZERO;
        long daysLate = java.time.Duration.between(planned, actualReturnTime).toDays();
        if (daysLate < 1) daysLate = 1; // jede Verspätung wird als 1 Tag berechnet
        return LATE_FEE_PER_DAY.multiply(BigDecimal.valueOf(daysLate));
    }

    private BigDecimal getDailyPriceForType(VehicleType type) {
        return switch (type) {
            case KLEINWAGEN -> BASE_PRICE_KLEINWAGEN;
            case KOMPAKTKLASSE -> BASE_PRICE_KOMPAKTKLASSE;
            case MITTELKLASSE -> BASE_PRICE_MITTELKLASSE;
            case OBERKLASSE -> BASE_PRICE_OBERKLASSE;
            case SUV -> BASE_PRICE_SUV;
            case VAN -> BASE_PRICE_VAN;
            case SPORTWAGEN -> BASE_PRICE_SPORTWAGEN;
        };
    }
}
