package com.rentacar.infrastructure.multitenancy;

/**
 * Interface für Entities, die Multi-Tenancy unterstützen.
 * Implementierende Entities werden automatisch mit Tenant-Filterung versehen.
 */
/**
 * Domain-Klasse für TenantAware.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public interface TenantAware {
    String getTenantId();

    void setTenantId(String tenantId);
}
