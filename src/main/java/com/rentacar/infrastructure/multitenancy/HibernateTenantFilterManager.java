package com.rentacar.infrastructure.multitenancy;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Hibernate Filter Manager for enabling tenant filtering on all queries.
 * This ensures that all database queries are automatically filtered by tenant
 * ID.
 */
@Slf4j
@Component
/**
 * Domain-Klasse für HibernateTenantFilterManager.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class HibernateTenantFilterManager {

    @PersistenceContext
    private EntityManager entityManager;

    public static final String TENANT_FILTER_NAME = "tenantFilter";
    public static final String TENANT_PARAMETER_NAME = "tenantId";

    /**
     * Enable tenant filter for the current session.
     * This should be called before executing any queries.
     */
    public void enableTenantFilter() {
        String currentTenant = TenantContext.getCurrentTenant();

        if (currentTenant == null) {
            log.warn("No tenant context found, tenant filter will not be applied");
            return;
        }

        Session session = entityManager.unwrap(Session.class);
        Filter filter = session.enableFilter(TENANT_FILTER_NAME);
        filter.setParameter(TENANT_PARAMETER_NAME, currentTenant);

        log.debug("Enabled tenant filter for tenant: {}", currentTenant);
    }

    /**
     * Disable tenant filter for the current session.
     * Use with caution - this removes tenant isolation!
     */
    public void disableTenantFilter() {
        Session session = entityManager.unwrap(Session.class);
        session.disableFilter(TENANT_FILTER_NAME);
        log.debug("Disabled tenant filter");
    }

    /**
     * Check if we're in a web request context.
     */
    private boolean isWebRequest() {
        return RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes;
    }
}
