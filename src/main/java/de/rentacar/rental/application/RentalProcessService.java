package de.rentacar.rental.application;

import de.rentacar.booking.domain.Booking;
import de.rentacar.booking.domain.BookingRepository;
import de.rentacar.booking.domain.BookingStatus;
import de.rentacar.rental.domain.Rental;
import de.rentacar.rental.domain.RentalRepository;
import de.rentacar.shared.domain.AuditService;
import de.rentacar.vehicle.domain.Vehicle;
import de.rentacar.vehicle.domain.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Application Service / Domain Service
 * Steuert den komplexen Prozess der Fahrzeugausgabe und -rücknahme.
 * Orchestriert Booking, Vehicle und Rental Context.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RentalProcessService {

    private final RentalRepository rentalRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final AuditService auditService;

    /**
     * Use Case: Fahrzeugübergabe (Check-out)
     * Wandelt eine bestätigte Buchung in eine aktive Miete um.
     *
     * @param bookingId Die ID der Buchung
     * @param currentMileage Der aktuelle Kilometerstand am Tacho
     * @param currentCondition Beschreibung des Zustands (Kratzer etc.)
     * @param staffUsername Der Mitarbeiter, der die Übergabe macht
     * @return Die ID des neuen Rental-Objekts
     */
    @Transactional
    public Long pickupVehicle(Long bookingId, Long currentMileage, String currentCondition, String staffUsername) {
        log.info("Starte Fahrzeugübergabe für Buchung ID: {}", bookingId);

        // 1. Buchung laden & validieren
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Buchung mit ID " + bookingId + " nicht gefunden"));

        validateBookingForPickup(booking);

        // 2. Fahrzeug laden
        // Wir nutzen die vehicleId aus der Booking (Loose Coupling)
        Vehicle vehicle = vehicleRepository.findById(booking.getVehicleId())
                .orElseThrow(() -> new IllegalStateException("Fahrzeug aus Buchung nicht gefunden (ID: " + booking.getVehicleId() + ")"));

        // 3. Fahrzeug-Status aktualisieren (Domain-Logik im Vehicle-Aggregate)
        // Wirft Fehler, wenn Fahrzeug nicht 'VERFÜGBAR' ist
        vehicle.markAsRented();

        // Optional: Falls der Tacho mehr drauf hat als im System (kann bei Überführungsfahrten passieren)
        if (currentMileage != null && currentMileage > vehicle.getMileage()) {
            vehicle.updateMileage(currentMileage);
        }
        vehicleRepository.save(vehicle);

        // 4. Rental erstellen (Factory Methode im Rental-Aggregate)
        Rental rental = Rental.startRental(
                booking.getId(),
                booking.getVehicleId(),
                booking.getCustomerId(),
                booking.getReturnDate(),
                currentMileage != null ? currentMileage : vehicle.getMileage(),
                currentCondition
        );

        rentalRepository.save(rental);

        // 5. Audit Log (NFR5)
        auditService.logAction(
                staffUsername,
                "PICKUP",
                "RENTAL",
                rental.getId().toString(),
                "Fahrzeug " + vehicle.getLicensePlate() + " übergeben. KM: " + rental.getPickupMileage(),
                "N/A" // IP könnte hier aus dem Web-Context kommen
        );

        log.info("Fahrzeugübergabe erfolgreich. Rental ID: {}", rental.getId());
        return rental.getId();
    }

    /**
     * Use Case: Fahrzeugrücknahme (Check-in)
     * Beendet die Miete, gibt das Fahrzeug frei und schließt die Buchung ab.
     */
    @Transactional
    public void returnVehicle(Long rentalId, Long returnMileage, String returnCondition, String staffUsername) {
        log.info("Starte Fahrzeugrücknahme für Rental ID: {}", rentalId);

        // 1. Rental laden
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("Mietvorgang nicht gefunden"));

        // 2. Rental abschließen (Domain-Logik im Rental-Aggregate)
        rental.performCheckin(returnMileage, returnCondition);
        rentalRepository.save(rental);

        // 3. Fahrzeug aktualisieren
        Vehicle vehicle = vehicleRepository.findById(rental.getVehicleId())
                .orElseThrow(() -> new IllegalStateException("Fahrzeug nicht gefunden"));

        vehicle.updateMileage(returnMileage);
        vehicle.markAsAvailable(); // Fahrzeug ist wieder frei für neue Buchungen
        vehicleRepository.save(vehicle);

        // 4. Buchung abschließen
        // Damit ist der gesamte Vorgang historisch abgeschlossen
        bookingRepository.findById(rental.getBookingId())
                .ifPresent(Booking::complete);

        // 5. Audit Log
        auditService.logAction(
                staffUsername,
                "RETURN",
                "RENTAL",
                rentalId.toString(),
                "Fahrzeug zurück. KM: " + returnMileage,
                "N/A"
        );

        log.info("Fahrzeugrücknahme erfolgreich abgeschlossen.");
    }

    // --- Private Helper Methoden ---

    private void validateBookingForPickup(Booking booking) {
        if (booking.getStatus() != BookingStatus.BESTÄTIGT) {
            throw new IllegalStateException("Fahrzeug kann nicht abgeholt werden. Buchungsstatus: " + booking.getStatus());
        }

        // Logik: Abholung darf frühestens am Tag der Buchung erfolgen (oder Kulanzregel)
        if (LocalDate.now().isBefore(booking.getPickupDate())) {
            // Optional: Man könnte hier Kulanz erlauben, z.B. "Abholung schon am Vorabend möglich?"
            // Für die Semesterarbeit: Strikt bleiben ist sicherer.
            throw new IllegalStateException("Abholung ist erst am " + booking.getPickupDate() + " möglich.");
        }
    }
}