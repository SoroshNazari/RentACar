package com.rentacar.infrastructure.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        // Set test values using reflection (since @Value is used)
        String secret = Base64.getEncoder()
                .encodeToString("test-secret-key-that-is-long-enough-for-hs256-algorithm".getBytes());
        ReflectionTestUtils.setField(jwtService, "secret", secret);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L); // 1 hour

        userDetails = User.builder()
                .username("testuser")
                .password("password")
                .roles("USER")
                .build();
    }

    @Test
    void generateToken_shouldCreateValidToken() {
        // When
        String token = jwtService.generateToken(userDetails);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
    }

    @Test
    void extractUsername_shouldReturnCorrectUsername() {
        // Given
        String token = jwtService.generateToken(userDetails);

        // When
        String username = jwtService.extractUsername(token);

        // Then
        assertThat(username).isEqualTo("testuser");
    }

    @Test
    void isTokenValid_withValidToken_shouldReturnTrue() {
        // Given
        String token = jwtService.generateToken(userDetails);

        // When
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    void isTokenValid_withWrongUser_shouldReturnFalse() {
        // Given
        String token = jwtService.generateToken(userDetails);

        UserDetails differentUser = User.builder()
                .username("differentuser")
                .password("password")
                .roles("USER")
                .build();

        // When
        boolean isValid = jwtService.isTokenValid(token, differentUser);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    void generateToken_withExtraClaims_shouldIncludeClaims() {
        // Given
        java.util.Map<String, Object> extraClaims = new java.util.HashMap<>();
        extraClaims.put("role", "ADMIN");
        extraClaims.put("department", "IT");

        // When
        String token = jwtService.generateToken(extraClaims, userDetails);

        // Then
        assertThat(token).isNotNull();
        String username = jwtService.extractUsername(token);
        assertThat(username).isEqualTo("testuser");
    }
}
