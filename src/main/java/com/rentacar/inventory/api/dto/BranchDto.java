package com.rentacar.inventory.api.dto;

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
public class BranchDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String name;
        @NotBlank
        private String address;
    }

    @Data
    public static class Response {
        private UUID id;
        private String name;
        private String address;
    }
}
