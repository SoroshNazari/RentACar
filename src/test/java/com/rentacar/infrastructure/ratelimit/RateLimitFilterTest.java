package com.rentacar.infrastructure.ratelimit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateLimitFilterTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private RateLimitFilter rateLimitFilter;

    @BeforeEach
    void setUp() {
        rateLimitFilter = new RateLimitFilter();
    }

    @Test
    void doFilterInternal_withinLimit_shouldAllowRequest() throws Exception {
        // Given
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void doFilterInternal_withXForwardedFor_shouldUseForwardedIP() throws Exception {
        // Given
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.1, 10.0.0.1");

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldNotFilter_withActuatorPath_shouldReturnTrue() throws Exception {
        // Given
        when(request.getRequestURI()).thenReturn("/actuator/health");

        // When
        boolean result = rateLimitFilter.shouldNotFilter(request);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void shouldNotFilter_withNormalPath_shouldReturnFalse() throws Exception {
        // Given
        when(request.getRequestURI()).thenReturn("/api/v1/vehicles");

        // When
        boolean result = rateLimitFilter.shouldNotFilter(request);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void doFilterInternal_exceedingLimit_shouldReturnTooManyRequests() throws Exception {
        // Given
        when(request.getRemoteAddr()).thenReturn("192.168.1.100");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);

        // When - Make 101 requests to exceed limit of 100
        for (int i = 0; i < 101; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        // Then - Last request should be rate limited
        verify(response, atLeastOnce()).setStatus(429);
        verify(response, atLeastOnce()).setContentType("application/json");
    }
}
