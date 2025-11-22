package com.rentacar.infrastructure.audit;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
/**
 * Domain Event.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class AuditLogEvent extends ApplicationEvent {

    private final String actor;
    private final String action;
    private final UUID entityId;
    private final LocalDateTime occurredAt;

    public AuditLogEvent(Object source, String actor, String action, UUID entityId) {
        super(source);
        this.actor = actor;
        this.action = action;
        this.entityId = entityId;
        this.occurredAt = LocalDateTime.now();
    }
}
