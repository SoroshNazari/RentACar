package com.rentacar.infrastructure.multitenancy;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TenantContextTest {

    @AfterEach
    void cleanup() {
        TenantContext.clear();
    }

    @Test
    void setCurrentTenant_shouldStoreTenantId() {
        // When
        TenantContext.setCurrentTenant("tenant-123");

        // Then
        assertThat(TenantContext.getCurrentTenant()).isEqualTo("tenant-123");
    }

    @Test
    void getCurrentTenant_whenNotSet_shouldReturnNull() {
        // When
        String tenant = TenantContext.getCurrentTenant();

        // Then
        assertThat(tenant).isNull();
    }

    @Test
    void clear_shouldRemoveTenantId() {
        // Given
        TenantContext.setCurrentTenant("tenant-456");
        assertThat(TenantContext.getCurrentTenant()).isEqualTo("tenant-456");

        // When
        TenantContext.clear();

        // Then
        assertThat(TenantContext.getCurrentTenant()).isNull();
    }

    @Test
    void tenantContext_shouldBeThreadLocal() {
        // Given
        TenantContext.setCurrentTenant("main-tenant");

        // When - Create new thread with different tenant
        Thread thread = new Thread(() -> {
            TenantContext.setCurrentTenant("thread-tenant");
            assertThat(TenantContext.getCurrentTenant()).isEqualTo("thread-tenant");
        });
        thread.start();
        try {
            thread.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Then - Main thread should still have original tenant
        assertThat(TenantContext.getCurrentTenant()).isEqualTo("main-tenant");
    }
}
