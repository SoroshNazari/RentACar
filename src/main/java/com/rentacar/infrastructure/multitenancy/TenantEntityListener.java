package com.rentacar.infrastructure.multitenancy;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * JPA Entity Listener for automatic tenant ID injection.
 * Automatically sets the tenant ID on entities before persisting or updating.
 */
@Slf4j
@Component
public class TenantEntityListener {

    @PrePersist
    public void setTenantOnCreate(Object entity) {
        if (entity instanceof TenantAware) {
            String currentTenant = TenantContext.getCurrentTenant();
            if (currentTenant != null) {
                ((TenantAware) entity).setTenantId(currentTenant);
                log.debug("Set tenant ID '{}' on entity {}", currentTenant, entity.getClass().getSimpleName());
            } else {
                log.warn("No tenant context found when creating entity {}", entity.getClass().getSimpleName());
            }
        }
    }

    @PreUpdate
    public void setTenantOnUpdate(Object entity) {
        if (entity instanceof TenantAware) {
            String currentTenant = TenantContext.getCurrentTenant();
            String entityTenant = ((TenantAware) entity).getTenantId();

            if (currentTenant != null && !currentTenant.equals(entityTenant)) {
                log.warn("Tenant mismatch: current={}, entity={}", currentTenant, entityTenant);
                // Prevent cross-tenant updates
                throw new SecurityException("Cannot update entity from different tenant");
            }
        }
    }
}
