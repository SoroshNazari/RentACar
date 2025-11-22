package com.rentacar.rental.api.controller;

import com.rentacar.rental.api.dto.RentalDto;
import com.rentacar.rental.service.RentalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rentals")
@RequiredArgsConstructor
@Tag(name = "Rental", description = "Rental Process API")
public class RentalController {

    private final RentalService rentalService;

    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Checkout vehicle (Handover to customer)")
    public void checkout(@Valid @RequestBody RentalDto.CheckoutRequest request) {
        rentalService.checkout(request.getBookingId());
    }

    @PostMapping("/checkin")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Checkin vehicle (Return from customer)")
    public void checkin(@Valid @RequestBody RentalDto.CheckinRequest request) {
        rentalService.checkin(
                request.getBookingId(),
                request.getMileage(),
                request.getDamageDescription(),
                request.isHasDamage());
    }
}
