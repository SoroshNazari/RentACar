package de.rentacar.shared.security;

import de.rentacar.security.UserRole; // Import der UserRole Enum
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User; // Import für Spring Security User
import org.springframework.security.core.userdetails.UserDetails; // Import für Spring Security UserDetails
import org.springframework.security.core.userdetails.UserDetailsService; // Import für Spring Security UserDetailsService
import org.springframework.security.provisioning.InMemoryUserDetailsManager; // Import für InMemoryUserDetailsManager
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security Konfiguration für RBAC (NFR3, NFR4)
 *
 * Rechtematrix:
 *
 * - ROLE_CUSTOMER:
 *   - Darf nur eigene Buchungen sehen und suchen.
 *   - Darf Fahrzeuge suchen und Details ansehen.
 *   - Darf Buchungen erstellen und eigene stornieren.
 *   - Darf eigene Kundendaten abrufen.
 *
 * - ROLE_EMPLOYEE:
 *   - Darf Flotte verwalten (Fahrzeuge hinzufügen, bearbeiten, löschen).
 *   - Darf Check-in/out von Fahrzeugen durchführen.
 *   - Darf alle Buchungen sehen, bestätigen, stornieren.
 *   - Darf alle Kundendaten sehen und aktualisieren.
 *   - Darf Schadensberichte erstellen.
 *
 * - ROLE_ADMIN:
 *   - Darf alles (alle Aktionen, die CUSTOMER und EMPLOYEE dürfen, plus Benutzerverwaltung, Systemkonfiguration etc.).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // Entferne die Injektion von CustomUserDetailsService, da wir InMemoryUserDetailsManager für Mock-User verwenden
    // private final CustomUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        UserDetails customer = User.builder()
            .username("customer")
            .password(passwordEncoder.encode("password"))
            .roles(UserRole.ROLE_CUSTOMER.name().substring(5)) // Entfernt "ROLE_" Präfix
            .build();

        UserDetails employee = User.builder()
            .username("employee")
            .password(passwordEncoder.encode("password"))
            .roles(UserRole.ROLE_EMPLOYEE.name().substring(5)) // Entfernt "ROLE_" Präfix
            .build();

        UserDetails admin = User.builder()
            .username("admin")
            .password(passwordEncoder.encode("password"))
            .roles(UserRole.ROLE_ADMIN.name().substring(5)) // Entfernt "ROLE_" Präfix
            .build();

        return new InMemoryUserDetailsManager(customer, employee, admin);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Für REST API, in Produktion sollte CSRF aktiviert sein
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .httpBasic(httpBasic -> {}) // Basic Auth aktivieren
            .authorizeHttpRequests(authz -> authz
                // Öffentliche Endpunkte
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/auth/login").permitAll() // Login-Endpunkt öffentlich
                .requestMatchers(HttpMethod.GET, "/api/assets/image").permitAll()
                .requestMatchers(HttpMethod.GET, "/images/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/assets/**").permitAll()

                // Kunden-Endpunkte
                .requestMatchers("/api/customers/register").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/customers/**").hasAnyRole("EMPLOYEE", "ADMIN") // Spezifische Regel für Update
                .requestMatchers("/api/customers/**").hasAnyRole("CUSTOMER", "EMPLOYEE", "ADMIN") // Generell für Lesezugriff/andere

                // Buchungs-Endpunkte
                .requestMatchers("/api/bookings/search").authenticated() // Geändert von permitAll()
                .requestMatchers("/api/bookings/**").hasAnyRole("CUSTOMER", "EMPLOYEE", "ADMIN")

                // Fahrzeug-Endpunkte
                .requestMatchers(HttpMethod.GET, "/api/vehicles").authenticated() // Geändert von permitAll()
                .requestMatchers(HttpMethod.GET, "/api/vehicles/**").authenticated() // Geändert von permitAll()
                .requestMatchers(HttpMethod.POST, "/api/vehicles").hasAnyRole("EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/vehicles/**").hasAnyRole("EMPLOYEE", "ADMIN")

                // Vermietungs-Endpunkte (nur Mitarbeiter und Admin)
                .requestMatchers("/api/rentals/**").hasAnyRole("EMPLOYEE", "ADMIN")

                // Admin-Endpunkte
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Alle anderen Anfragen erfordern Authentifizierung
                .anyRequest().authenticated()
            )
            // .userDetailsService(userDetailsService) // Entfernt, da InMemoryUserDetailsManager verwendet wird
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable())); // Für H2 Console

        return http.build();
    }
}
