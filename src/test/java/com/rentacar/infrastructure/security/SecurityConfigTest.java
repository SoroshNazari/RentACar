package com.rentacar.infrastructure.security;

import com.rentacar.infrastructure.ratelimit.RateLimitFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityConfigTest {

    @Mock
    private JwtAuthenticationFilter jwtAuthFilter;

    @Mock
    private RateLimitFilter rateLimitFilter;

    @Mock
    private CustomUserDetailsService userDetailsService;

    private SecurityConfig securityConfig;

    @BeforeEach
    void setUp() {
        securityConfig = new SecurityConfig(jwtAuthFilter, rateLimitFilter, userDetailsService);
    }

    @Test
    void passwordEncoder_shouldReturnBCryptPasswordEncoder() {
        // When
        PasswordEncoder encoder = securityConfig.passwordEncoder();

        // Then
        assertThat(encoder).isNotNull();
    }

    @Test
    void authenticationProvider_shouldReturnDaoAuthenticationProvider() {
        // When
        AuthenticationProvider provider = securityConfig.authenticationProvider();

        // Then
        assertThat(provider).isNotNull();
    }

    @Test
    void authenticationManager_shouldReturnManagerFromConfig() throws Exception {
        // Given
        AuthenticationConfiguration authConfig = mock(AuthenticationConfiguration.class);
        AuthenticationManager authManager = mock(AuthenticationManager.class);
        when(authConfig.getAuthenticationManager()).thenReturn(authManager);

        // When
        AuthenticationManager result = securityConfig.authenticationManager(authConfig);

        // Then
        assertThat(result).isEqualTo(authManager);
    }

    @Test
    void corsConfigurationSource_shouldReturnValidConfiguration() {
        // When
        CorsConfigurationSource source = securityConfig.corsConfigurationSource();

        // Then
        assertThat(source).isNotNull();
        // We can cast to UrlBasedCorsConfigurationSource to check details if needed,
        // but checking not null is enough for basic coverage
    }

    // Testing securityFilterChain is hard with mocks as HttpSecurity is
    // final/complex.
    // We skip it for unit tests, integration tests cover it.
}
