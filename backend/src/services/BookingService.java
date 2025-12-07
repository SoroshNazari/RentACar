package de.rentacar.booking.application;

import de.rentacar.booking.domain.*;
import de.rentacar.customer.domain.CustomerRepository;
import de.rentacar.shared.domain.AuditService;
import de.rentacar.vehicle.domain.Vehicle;
import de.rentacar.vehicle.domain.VehicleRepository;
import de.rentacar.vehicle.domain.VehicleType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Application Service für Buchungsverwaltung (Use Cases)
 */
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final PriceCalculationService priceCalculationService;
    private final AvailabilityService availabilityService;
    private final AuditService auditService;

    /**
     * Use Case: Fahrzeuge suchen (Zeitraum, Typ, Standort)
     */
    @Transactional(readOnly = true)
    public List<Vehicle> searchAvailableVehicles(VehicleType vehicleType, String location, 
                                                  LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);
        return vehicleRepository.findAvailableVehicles(vehicleType, location, startDate, endDate);
    }

    /**
     * Use Case: Buchung erstellen mit Verfügbarkeitsprüfung
     */
    @Transactional
    public Booking createBooking(Long customerId, Long vehicleId, LocalDate pickupDate,
                                 LocalDate returnDate, String pickupLocation, String returnLocation,
                                 boolean insurance, boolean additionalDriver, boolean childSeat,
                                 String username, String ipAddress) {
        // Validierung
        validateDateRange(pickupDate, returnDate);
        
        // Kunde prüfen
        customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Kunde nicht gefunden"));

        // Fahrzeug prüfen
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Fahrzeug nicht gefunden"));

        // Verfügbarkeitsprüfung (verhindert Überbuchung)
        if (!availabilityService.isVehicleAvailable(vehicleId, pickupDate, returnDate)) {
            throw new IllegalStateException("Fahrzeug ist im angegebenen Zeitraum nicht verfügbar");
        }

        // Preis berechnen
        BigDecimal basePrice = priceCalculationService.calculateTotalPrice(
                vehicle.getType(), pickupDate, returnDate);
        long days = java.time.temporal.ChronoUnit.DAYS.between(pickupDate, returnDate) + 1;
        BigDecimal extrasCost = priceCalculationService.calculateExtrasCost(days, insurance, additionalDriver, childSeat);
        BigDecimal totalPrice = basePrice.add(extrasCost != null ? extrasCost : BigDecimal.ZERO);

        // Buchung erstellen
        Booking booking = Booking.builder()
                .customerId(customerId)
                .vehicle(vehicle)
                .pickupDate(pickupDate)
                .returnDate(returnDate)
                .pickupLocation(pickupLocation)
                .returnLocation(returnLocation)
                .totalPrice(totalPrice)
                .status(BookingStatus.ANFRAGE)
                .insurance(insurance)
                .additionalDriver(additionalDriver)
                .childSeat(childSeat)
                .extrasCost(extrasCost)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        auditService.logAction(username, "BOOKING_CREATED", "Booking", 
                savedBooking.getId() != null ? savedBooking.getId().toString() : "NEW", 
                String.format("Buchung erstellt für Fahrzeug %s", vehicle.getLicensePlate()),
                ipAddress);

        savedBooking.confirm();
        vehicle.markAsRented();
        bookingRepository.save(savedBooking);
        vehicleRepository.save(vehicle);

        auditService.logAction(username, "BOOKING_CONFIRMED", "Booking",
                savedBooking.getId() != null ? savedBooking.getId().toString() : "NEW",
                "Buchung automatisch bestätigt", ipAddress);

        return savedBooking;
    }

    @Transactional
    public Booking createBooking(Long customerId, Long vehicleId, LocalDate pickupDate,
                                 LocalDate returnDate, String pickupLocation, String returnLocation,
                                 String username, String ipAddress) {
        return createBooking(customerId, vehicleId, pickupDate, returnDate, pickupLocation, returnLocation,
                false, false, false, username, ipAddress);
    }

    /**
     * Führt den Check-out (Fahrzeugübergabe) für eine Buchung durch.
     * Warum: Mitarbeiter erfassen Kilometerstand und Zustand bei Übergabe.
     */
    public Booking checkout(Long bookingId, java.math.BigDecimal mileage, String notes, String username) {
        if (mileage == null || mileage.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Mileage must be > 0");
        }
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getStatus() != de.rentacar.booking.domain.BookingStatus.BESTÄTIGT) {
            throw new IllegalStateException("Check-out only allowed for confirmed bookings");
        }
        // Check if booking has already been checked out
        if (booking.getCheckoutTime() != null) {
            throw new IllegalStateException("Booking has already been checked out");
        }
        var vehicle = booking.getVehicle();
        if (vehicle == null) {
            throw new IllegalStateException("Vehicle data missing");
        }
        if (vehicle.getMileage() != null && mileage.compareTo(java.math.BigDecimal.valueOf(vehicle.getMileage())) < 0) {
            throw new IllegalArgumentException("Mileage cannot be less than current vehicle mileage");
        }
        booking.setCheckoutTime(java.time.LocalDateTime.now());
        booking.setCheckoutMileage(mileage);
        booking.setCheckoutNotes(notes);
        vehicle.updateMileage(mileage.longValue());
        // Fahrzeug bleibt im Status 'RENTED' gemäß bestehender Logik.
        return bookingRepository.save(booking);
    }

    /**
     * Liefert bestätigte Buchungen für einen Abholtag (mit Fahrzeugdaten).
     */
    public java.util.List<Booking> getPickupsForDate(LocalDate date) {
        return bookingRepository.findConfirmedByPickupDateWithVehicle(date);
    }

    public java.util.List<Booking> getRequestsForDate(LocalDate date) {
        return bookingRepository.findRequestsByPickupDateWithVehicle(date);
    }

    public Booking checkin(Long bookingId, java.math.BigDecimal mileage, boolean damagePresent, String damageNotes, java.math.BigDecimal damageCost, java.time.LocalDateTime actualReturnTime) {
        if (mileage == null || mileage.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Kilometerstand muss > 0 sein");
        }
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Buchung nicht gefunden"));
        
        // Check if booking has already been checked in
        if (booking.getCheckinTime() != null) {
            throw new IllegalStateException("Booking has already been checked in");
        }
        
        // Check if booking has been checked out (only checked out bookings can be checked in)
        if (booking.getCheckoutTime() == null) {
            throw new IllegalStateException("Booking must first be checked out");
        }
        
        var vehicle = booking.getVehicle();
        if (vehicle == null) {
            throw new IllegalStateException("Vehicle data missing");
        }
        
        // Check if mileage is greater than checkout mileage
        if (booking.getCheckoutMileage() != null && mileage.compareTo(booking.getCheckoutMileage()) < 0) {
            throw new IllegalArgumentException("Mileage cannot be less than checkout mileage");
        }
        
        long days = java.time.temporal.ChronoUnit.DAYS.between(booking.getPickupDate(), booking.getReturnDate()) + 1;
        java.math.BigDecimal extraMileage = priceCalculationService.calculateExtraMileageCost(days, booking.getCheckoutMileage(), mileage);
        java.math.BigDecimal lateFee = priceCalculationService.calculateLateFee(booking.getReturnDate(), actualReturnTime);
        java.math.BigDecimal dmgCost = damagePresent ? (damageCost != null ? damageCost : java.math.BigDecimal.ZERO) : java.math.BigDecimal.ZERO;

        booking.setCheckinTime(actualReturnTime);
        booking.setCheckinMileage(mileage);
        booking.setDamagePresent(damagePresent);
        booking.setDamageNotes(damageNotes);
        booking.setDamageCost(dmgCost);
        booking.setExtraMileageCost(extraMileage);
        booking.setLateFee(lateFee);
        booking.setStatus(de.rentacar.booking.domain.BookingStatus.ABGESCHLOSSEN);

        vehicle.updateMileage(mileage.longValue());
        vehicle.markAsAvailable();
        return bookingRepository.save(booking);
    }

    public java.util.List<Booking> getReturnsForDate(LocalDate date) {
        return bookingRepository.findConfirmedByReturnDateWithVehicle(date);
    }

    /**
     * Use Case: Buchung bestätigen
     */
    @Transactional
    public void confirmBooking(Long bookingId, String username, String ipAddress) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Buchung nicht gefunden"));

        // Verfügbarkeit nochmal prüfen
        if (!availabilityService.isVehicleAvailable(booking.getVehicle().getId(), 
                booking.getPickupDate(), booking.getReturnDate())) {
            throw new IllegalStateException("Fahrzeug ist nicht mehr verfügbar");
        }

        booking.confirm();
        booking.getVehicle().markAsRented();
        
        bookingRepository.save(booking);
        vehicleRepository.save(booking.getVehicle());

        auditService.logAction(username, "BOOKING_CONFIRMED", "Booking", 
                bookingId.toString(), "Buchung bestätigt", ipAddress);
    }

    /**
     * Use Case: Buchung stornieren (bis 24h vor Abholung)
     */
    @Transactional
    public void cancelBooking(Long bookingId, String username, String ipAddress) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Buchung nicht gefunden"));

        booking.cancel();
        
        // Fahrzeug wieder verfügbar machen, wenn es bestätigt war
        if (booking.getStatus() == BookingStatus.STORNIERT) {
            booking.getVehicle().markAsAvailable();
            vehicleRepository.save(booking.getVehicle());
        }
        
        bookingRepository.save(booking);

        auditService.logAction(username, "BOOKING_CANCELLED", "Booking", 
                bookingId.toString(), "Buchung storniert", ipAddress);
    }

    /**
     * Use Case: Buchungshistorie pro Kunde
     */
    @Transactional(readOnly = true)
    public List<Booking> getBookingHistory(Long customerId) {
        return bookingRepository.findByCustomerIdWithVehicle(customerId);
    }

    /**
     * Use Case: Alle Buchungen abrufen (für Mitarbeiter/Admin)
     */
    @Transactional(readOnly = true)
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Datum darf nicht null sein");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Abholdatum darf nicht in der Vergangenheit liegen");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Abholdatum muss vor Rückgabedatum liegen");
        }
    }
}
