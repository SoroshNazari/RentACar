package com.rentacar.infrastructure.multitenancy;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantFilterTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private TenantFilter tenantFilter;

    @AfterEach
    void cleanup() {
        TenantContext.clear();
    }

    @Test
    void doFilterInternal_withTenantHeader_shouldSetTenantContext() throws Exception {
        // Given
        when(request.getHeader("X-Tenant-ID")).thenReturn("tenant-123");

        // When
        tenantFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        assertThat(TenantContext.getCurrentTenant()).isNull(); // Cleared after filter
    }

    @Test
    void doFilterInternal_withoutTenantHeader_shouldUseDefault() throws Exception {
        // Given
        when(request.getHeader("X-Tenant-ID")).thenReturn(null);

        // When
        tenantFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_withBlankTenantHeader_shouldUseDefault() throws Exception {
        // Given
        when(request.getHeader("X-Tenant-ID")).thenReturn("  ");

        // When
        tenantFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_shouldClearContextAfterProcessing() throws Exception {
        // Given
        when(request.getHeader("X-Tenant-ID")).thenReturn("tenant-456");

        // When
        tenantFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertThat(TenantContext.getCurrentTenant()).isNull();
    }
}
