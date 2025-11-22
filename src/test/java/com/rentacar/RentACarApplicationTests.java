package com.rentacar;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentacar.booking.api.dto.BookingDto;
import com.rentacar.booking.domain.model.PriceConfiguration;
import com.rentacar.booking.repository.PriceConfigurationRepository;
import com.rentacar.inventory.api.dto.VehicleDto;
import com.rentacar.inventory.domain.model.Branch;
import com.rentacar.inventory.domain.model.VehicleType;
import com.rentacar.inventory.repository.BranchRepository;
import com.rentacar.rental.api.dto.RentalDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

/**
 * Integration Test für den vollständigen Workflow mit H2-Datenbank.
 * Testet: Vehicle → Search → Booking → Checkout → Checkin
 */
@SpringBootTest
@AutoConfigureMockMvc
class RentACarApplicationTests {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private BranchRepository branchRepository;

        @Autowired
        private PriceConfigurationRepository priceConfigurationRepository;

        private UUID branchId;
        private UUID customerId;

        @BeforeEach
        void setup() {
                Branch branch = Branch.builder().name("Test Branch").address("Test Address").build();
                branch = branchRepository.save(branch);
                branchId = branch.getId();
                customerId = UUID.randomUUID(); // Mock customer ID

                PriceConfiguration priceConfig = PriceConfiguration.builder()
                                .vehicleType(VehicleType.LIMOUSINE)
                                .dailyRate(new BigDecimal("100.00"))
                                .build();
                priceConfigurationRepository.save(priceConfig);
        }

        @Test
        @WithMockUser(username = "admin", roles = { "ADMIN" })
        void testFullFlow() throws Exception {
                // 1. Create Vehicle
                VehicleDto.CreateRequest vehicleRequest = new VehicleDto.CreateRequest();
                vehicleRequest.setLicensePlate("HH-AB-123");
                vehicleRequest.setVin("VIN123456789");
                vehicleRequest.setBrand("BMW");
                vehicleRequest.setModel("320i");
                vehicleRequest.setType(VehicleType.LIMOUSINE);
                vehicleRequest.setMileage(1000);
                vehicleRequest.setLocationId(branchId);

                MvcResult vehicleResult = mockMvc.perform(post("/api/v1/inventory/vehicles")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(vehicleRequest)))
                                .andExpect(status().isCreated())
                                .andReturn();

                VehicleDto.Response vehicle = objectMapper.readValue(vehicleResult.getResponse().getContentAsString(),
                                VehicleDto.Response.class);
                UUID vehicleId = vehicle.getId();

                // 2. Search Vehicle
                mockMvc.perform(get("/api/v1/bookings/search")
                                .param("from", LocalDateTime.now().plusDays(1).toString())
                                .param("to", LocalDateTime.now().plusDays(3).toString())
                                .param("type", "LIMOUSINE"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].id").value(vehicleId.toString()));

                // 3. Create Booking
                BookingDto.CreateRequest bookingRequest = new BookingDto.CreateRequest();
                bookingRequest.setVehicleId(vehicleId);
                bookingRequest.setCustomerId(customerId);
                bookingRequest.setPickupBranchId(branchId);
                bookingRequest.setStart(LocalDateTime.now().plusDays(1));
                bookingRequest.setEnd(LocalDateTime.now().plusDays(3));

                MvcResult bookingResult = mockMvc.perform(post("/api/v1/bookings")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(bookingRequest)))
                                .andExpect(status().isCreated())
                                .andReturn();

                BookingDto.Response booking = objectMapper.readValue(bookingResult.getResponse().getContentAsString(),
                                BookingDto.Response.class);
                UUID bookingId = booking.getId();

                // 4. Checkout (Rental) - Need to update booking status manually or mock time
                // passing?
                // Requirement says: "Sperre: Das Fahrzeug ist nun für diesen Zeitraum
                // blockiert."
                // Checkout sets status to VERMIETET.
                // But wait, Checkout usually happens at start time.
                // My logic doesn't enforce "current time >= start time" for checkout, but it
                // checks "Booking CONFIRMED".
                // Booking is confirmed upon creation.

                RentalDto.CheckoutRequest checkoutRequest = new RentalDto.CheckoutRequest();
                checkoutRequest.setBookingId(bookingId);

                mockMvc.perform(post("/api/v1/rentals/checkout")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(checkoutRequest)))
                                .andExpect(status().isOk());

                // 5. Checkin
                RentalDto.CheckinRequest checkinRequest = new RentalDto.CheckinRequest();
                checkinRequest.setBookingId(bookingId);
                checkinRequest.setMileage(1200);
                checkinRequest.setHasDamage(false);

                mockMvc.perform(post("/api/v1/rentals/checkin")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(checkinRequest)))
                                .andExpect(status().isOk());
        }
}
