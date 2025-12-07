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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

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

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // CustomUserDetailsService wird als @Service automatisch als Bean registriert
    // und lädt Benutzer aus der Datenbank

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS aktivieren
            .csrf(csrf -> csrf.disable()) // Für REST API, in Produktion sollte CSRF aktiviert sein
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // Session-Verwaltung durch Spring Security
                .maximumSessions(1) // Nur eine aktive Session pro Benutzer
                .maxSessionsPreventsLogin(false) // Neue Login-Versuche invalidieren alte Sessions
                .and()
                .sessionFixation().migrateSession() // Session-Fixation-Schutz
                .invalidSessionUrl("/api/auth/login?expired=true") // URL bei abgelaufener Session
            )
            .formLogin(form -> form
                .permitAll() // Erlaubt allen Zugriff auf die Login-Seite
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout") // URL für den Logout
                .invalidateHttpSession(true) // Session serverseitig invalidieren
                .deleteCookies("JSESSIONID") // Session-Cookie löschen
                .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler()) // HTTP 200 OK bei erfolgreichem Logout
                .permitAll() // Erlaubt allen Zugriff auf die Logout-Funktion
            )
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
                .requestMatchers(HttpMethod.POST, "/api/customers/activate").permitAll() // Account-Aktivierung öffentlich
                .requestMatchers(HttpMethod.PUT, "/api/customers/**").hasAnyRole("EMPLOYEE", "ADMIN") // Spezifische Regel für Update
                .requestMatchers("/api/customers/**").hasAnyRole("CUSTOMER", "EMPLOYEE", "ADMIN") // Generell für Lesezugriff/andere

                // Buchungs-Endpunkte
                .requestMatchers("/api/bookings/search").authenticated()
                .requestMatchers("/api/bookings/**").hasAnyRole("CUSTOMER", "EMPLOYEE", "ADMIN")

                // Fahrzeug-Endpunkte
                .requestMatchers(HttpMethod.GET, "/api/vehicles").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/vehicles/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/vehicles").hasAnyRole("EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/vehicles/**").hasAnyRole("EMPLOYEE", "ADMIN")

                // Vermietungs-Endpunkte (nur Mitarbeiter und Admin)
                .requestMatchers("/api/rentals/**").hasAnyRole("EMPLOYEE", "ADMIN")

                // Admin-Endpunkte
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Alle anderen Anfragen erfordern Authentifizierung
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable())); // Für H2 Console

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true); // Wichtig für Session-Cookies
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
