package com.rentacar.infrastructure.multitenancy;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TenantEntityListenerTest {

    private final TenantEntityListener listener = new TenantEntityListener();

    @AfterEach
    void cleanup() {
        TenantContext.clear();
    }

    @Test
    void setTenantOnCreate_shouldSetTenantId() {
        // Given
        TenantContext.setCurrentTenant("tenant-123");
        TestTenantAwareEntity entity = new TestTenantAwareEntity();

        // When
        listener.setTenantOnCreate(entity);

        // Then
        assertThat(entity.getTenantId()).isEqualTo("tenant-123");
    }

    @Test
    void setTenantOnCreate_whenNoTenantContext_shouldNotSetTenantId() {
        // Given
        TestTenantAwareEntity entity = new TestTenantAwareEntity();

        // When
        listener.setTenantOnCreate(entity);

        // Then
        assertThat(entity.getTenantId()).isNull();
    }

    @Test
    void setTenantOnCreate_withNonTenantAwareEntity_shouldDoNothing() {
        // Given
        TenantContext.setCurrentTenant("tenant-123");
        Object entity = new Object();

        // When & Then - should not throw
        listener.setTenantOnCreate(entity);
    }

    @Test
    void setTenantOnUpdate_withMatchingTenant_shouldSucceed() {
        // Given
        TenantContext.setCurrentTenant("tenant-123");
        TestTenantAwareEntity entity = new TestTenantAwareEntity();
        entity.setTenantId("tenant-123");

        // When & Then - should not throw
        listener.setTenantOnUpdate(entity);
    }

    @Test
    void setTenantOnUpdate_withMismatchedTenant_shouldThrowException() {
        // Given
        TenantContext.setCurrentTenant("tenant-123");
        TestTenantAwareEntity entity = new TestTenantAwareEntity();
        entity.setTenantId("tenant-456");

        // When & Then
        assertThatThrownBy(() -> listener.setTenantOnUpdate(entity))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Cannot update entity from different tenant");
    }

    @Test
    void setTenantOnUpdate_withNoTenantContext_shouldSucceed() {
        // Given
        TestTenantAwareEntity entity = new TestTenantAwareEntity();
        entity.setTenantId("tenant-123");

        // When & Then - should not throw
        listener.setTenantOnUpdate(entity);
    }

    // Test helper class
    private static class TestTenantAwareEntity implements TenantAware {
        private String tenantId;

        @Override
        public String getTenantId() {
            return tenantId;
        }

        @Override
        public void setTenantId(String tenantId) {
            this.tenantId = tenantId;
        }
    }
}
