package com.rentacar.infrastructure.audit;

import com.rentacar.rental.domain.model.AuditLog;
import com.rentacar.rental.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuditLogListenerTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogListener auditLogListener;

    @Test
    void handleAuditLogEvent_shouldSaveAuditLog() {
        // Given
        UUID entityId = UUID.randomUUID();
        AuditLogEvent event = new AuditLogEvent(this, "EMPLOYEE", "CREATE_VEHICLE", entityId);

        // When
        auditLogListener.handleAuditLogEvent(event);

        // Then
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog savedLog = captor.getValue();
        assertThat(savedLog.getActor()).isEqualTo("EMPLOYEE");
        assertThat(savedLog.getAction()).isEqualTo("CREATE_VEHICLE");
        assertThat(savedLog.getEntityId()).isEqualTo(entityId);
        assertThat(savedLog.getTimestamp()).isNotNull();
    }

    @Test
    void handleAuditLogEvent_withCustomerAction_shouldSaveCorrectly() {
        // Given
        UUID entityId = UUID.randomUUID();
        AuditLogEvent event = new AuditLogEvent(this, "CUSTOMER", "CREATE_BOOKING", entityId);

        // When
        auditLogListener.handleAuditLogEvent(event);

        // Then
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog savedLog = captor.getValue();
        assertThat(savedLog.getActor()).isEqualTo("CUSTOMER");
        assertThat(savedLog.getAction()).isEqualTo("CREATE_BOOKING");
    }
}
