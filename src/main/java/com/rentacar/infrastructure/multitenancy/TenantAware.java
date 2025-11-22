package com.rentacar.infrastructure.multitenancy;

/**
 * Interface für Entities, die Multi-Tenancy unterstützen.
 * Implementierende Entities werden automatisch mit Tenant-Filterung versehen.
 */
public interface TenantAware {
    String getTenantId();

    void setTenantId(String tenantId);
}
