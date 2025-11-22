package com.rentacar.booking.api.controller;

import com.rentacar.booking.api.dto.BookingDto;
import com.rentacar.booking.domain.model.Booking;
import com.rentacar.booking.service.BookingService;
import com.rentacar.inventory.domain.model.Vehicle;
import com.rentacar.inventory.domain.model.VehicleType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller für die Verwaltung von Buchungen.
 * 
 * <p>
 * Dieser Controller bietet Endpunkte für:
 * <ul>
 * <li>Suche nach verfügbaren Fahrzeugen</li>
 * <li>Erstellung neuer Buchungen</li>
 * <li>Stornierung bestehender Buchungen</li>
 * </ul>
 * 
 * <p>
 * Alle Endpunkte sind unter {@code /api/v1/bookings} verfügbar.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking", description = "Booking Management API")
public class BookingController {

    private final BookingService bookingService;

    /**
     * Sucht nach verfügbaren Fahrzeugen für einen bestimmten Zeitraum.
     * 
     * @param from      Startdatum und -zeit der Buchung
     * @param to        Enddatum und -zeit der Buchung
     * @param stationId Optional: ID der gewünschten Station (noch nicht
     *                  implementiert)
     * @param type      Gewünschter Fahrzeugtyp
     * @return Liste der verfügbaren Fahrzeuge
     */
    @GetMapping("/search")
    @Operation(summary = "Search available vehicles")
    public List<Vehicle> search(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) UUID stationId, // Not used in service yet, but in requirements
            @RequestParam VehicleType type) {

        // Note: stationId filter is not implemented in service yet as per previous
        // step,
        // but we can add it later. For now just search by type and availability.
        return bookingService.searchVehicles(from, to, type);
    }

    /**
     * Erstellt eine neue Buchung.
     * 
     * @param request Buchungsanfrage mit allen erforderlichen Daten
     * @return Die erstellte Buchung als Response-DTO
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a booking")
    public BookingDto.Response createBooking(@Valid @RequestBody BookingDto.CreateRequest request) {
        Booking booking = bookingService.createBooking(
                request.getCustomerId(),
                request.getVehicleId(),
                request.getPickupBranchId(),
                request.getReturnBranchId() != null ? request.getReturnBranchId() : request.getPickupBranchId(),
                request.getStart(),
                request.getEnd());
        return mapToResponse(booking);
    }

    /**
     * Storniert eine bestehende Buchung.
     * 
     * <p>
     * Die Stornierung ist nur möglich, wenn die Buchung mindestens 24 Stunden
     * vor dem geplanten Abholtermin storniert wird.
     * 
     * @param id ID der zu stornierenden Buchung
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Cancel a booking")
    public void cancelBooking(@PathVariable UUID id) {
        bookingService.cancelBooking(id);
    }

    /**
     * Konvertiert eine Booking-Entity in ein Response-DTO.
     * 
     * @param booking Die zu konvertierende Buchung
     * @return Das Response-DTO
     */
    private BookingDto.Response mapToResponse(Booking booking) {
        BookingDto.Response response = new BookingDto.Response();
        response.setId(booking.getId());
        response.setCustomerId(booking.getCustomerId());
        response.setVehicleId(booking.getVehicleId());
        response.setStart(booking.getStartTime());
        response.setEnd(booking.getEndTime());
        response.setStatus(booking.getStatus());
        response.setTotalPrice(booking.getTotalPrice());
        return response;
    }
}
