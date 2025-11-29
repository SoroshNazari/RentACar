package de.rentacar.shared.security;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        try {
            // Authentifizierung durchführen (wirft Exception bei falschen Credentials)
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );

            // Benutzer abrufen
            User user = userRepository.findByUsername(request.username())
                    .orElseThrow(() -> new BadCredentialsException("Benutzer nicht gefunden"));

            // Antwort erstellen
            Map<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());
            response.put("roles", user.getRoles().stream()
                    .map(Role::name)
                    .collect(Collectors.toList()));
            response.put("authenticated", true);

            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of(
                    "authenticated", false,
                    "error", "Ungültige Anmeldedaten"
            ));
        }
    }

    public record LoginRequest(String username, String password) {}
}

