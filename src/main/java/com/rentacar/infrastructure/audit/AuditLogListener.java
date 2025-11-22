package com.rentacar.infrastructure.audit;

import com.rentacar.rental.domain.model.AuditLog;
import com.rentacar.rental.repository.AuditLogRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AuditLogListener {

    private final AuditLogRepository auditLogRepository;

    @Async
    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleAuditLogEvent(AuditLogEvent event) {
        @NonNull
        AuditLog log = AuditLog.builder()
                .actor(event.getActor())
                .action(event.getAction())
                .entityId(event.getEntityId())
                .timestamp(event.getOccurredAt())
                .build();

        auditLogRepository.save(log);
    }
}
