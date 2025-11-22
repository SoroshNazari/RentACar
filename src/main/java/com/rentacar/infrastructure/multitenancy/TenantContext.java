package com.rentacar.infrastructure.multitenancy;

import lombok.extern.slf4j.Slf4j;

/**
 * Thread-local storage for current tenant context.
 */
@Slf4j
/**
 * Domain-Klasse für TenantContext.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class TenantContext {

    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

    public static void setCurrentTenant(String tenantId) {
        log.debug("Setting tenant to: {}", tenantId);
        currentTenant.set(tenantId);
    }

    public static String getCurrentTenant() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
