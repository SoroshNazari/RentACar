package com.rentacar.infrastructure.security.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTOs für Authentication-Endpoints.
 */
/**
 * Data Transfer Object.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class AuthDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        private String username;
        private String password;
        private String roles; // Komma-separiert: "CUSTOMER", "EMPLOYEE", "ADMIN"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String username;
        private String roles;
    }
}
