package de.rentacar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Öffentlich zugänglich (Login, Registrierung, H2-Konsole)
                        .requestMatchers("/api/auth/**", "/api/customers/register").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        // WICHTIG: Suche und Fahrzeugliste öffentlich machen
                        .requestMatchers(HttpMethod.GET, "/api/bookings/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vehicles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vehicles").permitAll()

                        // Bilder/Assets laden erlauben
                        .requestMatchers(HttpMethod.GET, "/api/assets/**").permitAll()

                        // Alles andere erfordert Login
                        .anyRequest().authenticated()
                )
                // Fix für H2-Konsole (damit Frames angezeigt werden dürfen)
                .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}