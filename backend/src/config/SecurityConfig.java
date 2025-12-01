package de.rentacar.shared.security;

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

/**
 * Spring Security Konfiguration für RBAC (NFR3, NFR4)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
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
                .requestMatchers("/api/customers/**").hasAnyRole("CUSTOMER", "EMPLOYEE", "ADMIN")
                
                // Buchungs-Endpunkte
                .requestMatchers("/api/bookings/search").permitAll() // Öffentliche Suche
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
            .userDetailsService(userDetailsService)
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable())); // Für H2 Console

        return http.build();
    }
}
