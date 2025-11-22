package com.rentacar.infrastructure.multitenancy;

import jakarta.persistence.EntityManager;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HibernateTenantFilterManagerTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private Session session;

    @Mock
    private Filter filter;

    @InjectMocks
    private HibernateTenantFilterManager filterManager;

    @AfterEach
    void cleanup() {
        TenantContext.clear();
    }

    @Test
    void enableTenantFilter_withTenantContext_shouldEnableFilter() {
        // Given
        String tenantId = "tenant-123";
        TenantContext.setCurrentTenant(tenantId);

        when(entityManager.unwrap(Session.class)).thenReturn(session);
        when(session.enableFilter(HibernateTenantFilterManager.TENANT_FILTER_NAME)).thenReturn(filter);

        // When
        filterManager.enableTenantFilter();

        // Then
        verify(session).enableFilter(HibernateTenantFilterManager.TENANT_FILTER_NAME);
        verify(filter).setParameter(HibernateTenantFilterManager.TENANT_PARAMETER_NAME, tenantId);
    }

    @Test
    void enableTenantFilter_withoutTenantContext_shouldDoNothing() {
        // Given
        TenantContext.clear();

        // When
        filterManager.enableTenantFilter();

        // Then
        verify(entityManager, never()).unwrap(any());
    }

    @Test
    void disableTenantFilter_shouldDisableFilter() {
        // Given
        when(entityManager.unwrap(Session.class)).thenReturn(session);

        // When
        filterManager.disableTenantFilter();

        // Then
        verify(session).disableFilter(HibernateTenantFilterManager.TENANT_FILTER_NAME);
    }
}
