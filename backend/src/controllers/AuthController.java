package de.rentacar.shared.security;

import de.rentacar.shared.security.LoginAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller für Authentifizierung
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final LoginAttemptService loginAttemptService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request,
                                                      HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        String username = request.username();
        
        try {
            // Rate Limiting: Prüfe ob Login erlaubt ist
            if (!loginAttemptService.isAllowed(ipAddress, username)) {
                return ResponseEntity.status(429).body(Map.of(
                        "authenticated", false,
                        "error", "Zu viele fehlgeschlagene Login-Versuche. Bitte versuchen Sie es in 15 Minuten erneut."
                ));
            }

            // Prüfe ob Benutzer existiert
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> {
                        loginAttemptService.recordFailedAttempt(ipAddress, username);
                        return new BadCredentialsException("User not found");
                    });

            // Prüfe ob Account aktiviert ist
            if (!user.isEnabled()) {
                return ResponseEntity.status(401).body(Map.of(
                        "authenticated", false,
                        "error", "Account ist nicht aktiviert. Bitte aktivieren Sie Ihren Account über den Link in der E-Mail."
                ));
            }

            // Authentifizierung durchführen (wirft Exception bei falschen Credentials)
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.password())
            );

            // Erfolgreicher Login: Zähler zurücksetzen
            loginAttemptService.recordSuccessfulAttempt(ipAddress, username);

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());
            response.put("roles", user.getRoles().stream()
                    .map(Role::name)
                    .collect(Collectors.toList()));
            response.put("authenticated", true);

            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            // Fehlgeschlagener Login: Versuch registrieren
            loginAttemptService.recordFailedAttempt(ipAddress, username);
            return ResponseEntity.status(401).body(Map.of(
                    "authenticated", false,
                    "error", "Ungültiger Benutzername oder Passwort"
            ));
        } catch (Exception e) {
            // Log für Debugging
            System.err.println("Login error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            loginAttemptService.recordFailedAttempt(ipAddress, username);
            return ResponseEntity.status(401).body(Map.of(
                    "authenticated", false,
                    "error", "Anmeldung fehlgeschlagen: " + e.getMessage()
            ));
        }
    }

    public record LoginRequest(String username, String password) {}
}

