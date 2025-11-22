package com.rentacar.rental.repository;

import com.rentacar.rental.domain.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
/**
 * Repository-Interface für Datenbankzugriff.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
}
