package com.rentacar.infrastructure.security.repository;

import com.rentacar.infrastructure.security.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository für User-Entity.
 */
@Repository
/**
 * Repository-Interface für Datenbankzugriff.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);
}
