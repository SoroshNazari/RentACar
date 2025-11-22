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

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking", description = "Booking Management API")
public class BookingController {

    private final BookingService bookingService;

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

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Cancel a booking")
    public void cancelBooking(@PathVariable UUID id) {
        bookingService.cancelBooking(id);
    }

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
