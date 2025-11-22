package com.rentacar.customer.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

/**
 * Data Transfer Object.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class CustomerDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        @Email
        @NotBlank
        private String email;
        @NotBlank
        private String driverLicense;
        @NotBlank
        private String address;
    }

    @Data
    public static class Response {
        private UUID id;
        private String customerNumber;
        private String firstName;
        private String lastName;
        private String email;
        // Note: driverLicense and address are encrypted and not exposed in response
    }
}
