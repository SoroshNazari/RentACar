package com.rentacar.infrastructure.security.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * User-Entity für JWT-basierte Authentifizierung.
 * Speichert Benutzerdaten mit verschlüsseltem Passwort.
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
/**
 * Domain-Klasse für User.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // BCrypt-verschlüsselt

    @Column(nullable = false)
    private String roles; // Komma-separiert: "CUSTOMER", "EMPLOYEE", "ADMIN"

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;
}
