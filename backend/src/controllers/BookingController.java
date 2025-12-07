package de.rentacar.booking.web;

import de.rentacar.booking.application.BookingService;
import de.rentacar.booking.domain.Booking;
import de.rentacar.vehicle.domain.Vehicle;
import de.rentacar.vehicle.domain.VehicleType;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller für Buchungsverwaltung
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()") // CUSTOMER darf suchen
    public ResponseEntity<List<Vehicle>> searchAvailableVehicles(
            @RequestParam VehicleType vehicleType,
            @RequestParam String location,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<Vehicle> vehicles = bookingService.searchAvailableVehicles(
                    vehicleType, location.trim(), startDate, endDate);
            return ResponseEntity.ok(vehicles);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'ADMIN')") // Alle dürfen Buchungen erstellen
    public ResponseEntity<Booking> createBooking(@RequestBody CreateBookingRequest request,
                                                Authentication authentication,
                                                HttpServletRequest httpRequest) {
        Booking booking = bookingService.createBooking(
                request.customerId(),
                request.vehicleId(),
                request.pickupDate(),
                request.returnDate(),
                request.pickupLocation(),
                request.returnLocation(),
                request.insurance(),
                request.additionalDriver(),
                request.childSeat(),
                authentication.getName(),
                httpRequest.getRemoteAddr()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public ResponseEntity<Void> confirmBooking(@PathVariable Long id,
                                              Authentication authentication,
                                              HttpServletRequest httpRequest) {
        bookingService.confirmBooking(id, authentication.getName(), httpRequest.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'ADMIN')") // CUSTOMER darf eigene Buchungen stornieren, EMPLOYEE/ADMIN alle
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id,
                                             Authentication authentication,
                                             HttpServletRequest httpRequest) {
        // TODO: Zusätzliche Logik im Service, um sicherzustellen, dass CUSTOMER nur eigene Buchungen stornieren kann
        bookingService.cancelBooking(id, authentication.getName(), httpRequest.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')") // Nur Mitarbeiter und Admin dürfen alle Buchungen sehen
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN') or (hasRole('CUSTOMER') and #customerId == authentication.principal.id)") // CUSTOMER darf nur eigene Buchungen sehen
    public ResponseEntity<List<Booking>> getBookingHistory(@PathVariable Long customerId) {
        return ResponseEntity.ok(bookingService.getBookingHistory(customerId));
    }

    public record CreateBookingRequest(
            Long customerId,
            Long vehicleId,
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pickupDate,
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate returnDate,
            String pickupLocation,
            String returnLocation,
            boolean insurance,
            boolean additionalDriver,
            boolean childSeat
    ) {}

    @PutMapping("/{id}/checkout")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public ResponseEntity<Booking> checkout(@PathVariable Long id, @RequestBody CheckoutRequest request) {
        try {
            Booking updated = bookingService.checkout(id, request.mileage(), request.notes(), "employee");
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @GetMapping("/pickups")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public ResponseEntity<List<Booking>> pickups(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getPickupsForDate(date));
    }

    @GetMapping("/returns")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public ResponseEntity<List<Booking>> returns(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getReturnsForDate(date));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public ResponseEntity<List<Booking>> requests(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getRequestsForDate(date));
    }

    @PutMapping("/{id}/checkin")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public ResponseEntity<Booking> checkin(@PathVariable Long id, @RequestBody CheckinRequest request) {
        try {
            Booking updated = bookingService.checkin(id, request.mileage(), request.damagePresent(), request.damageNotes(), request.damageCost(), request.actualReturnTime());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    public record CheckoutRequest(java.math.BigDecimal mileage, String notes) {}
    public record CheckinRequest(java.math.BigDecimal mileage, Boolean damagePresent, String damageNotes, java.math.BigDecimal damageCost, java.time.LocalDateTime actualReturnTime) {}
}
