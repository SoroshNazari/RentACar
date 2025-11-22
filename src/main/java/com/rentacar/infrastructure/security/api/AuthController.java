package com.rentacar.infrastructure.security.api;

import com.rentacar.infrastructure.security.CustomUserDetailsService;
import com.rentacar.infrastructure.security.JwtService;
import com.rentacar.infrastructure.security.api.dto.AuthDto;
import com.rentacar.infrastructure.security.domain.User;
import com.rentacar.infrastructure.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller für Authentication (Login, Register).
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
/**
 * REST Controller für infrastructure-Verwaltung.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Login-Endpoint.
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@RequestBody AuthDto.LoginRequest request) {
        // Authentifiziere User
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        // Lade UserDetails und generiere Token
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String jwtToken = jwtService.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();

        return ResponseEntity.ok(AuthDto.AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .roles(user.getRoles())
                .build());
    }

    /**
     * Register-Endpoint.
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(@RequestBody AuthDto.RegisterRequest request) {
        // Prüfe ob Username bereits existiert
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().build();
        }

        // Erstelle neuen User
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(request.getRoles() != null ? request.getRoles() : "CUSTOMER")
                .enabled(true)
                .build();

        userRepository.save(user);

        // Generiere Token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String jwtToken = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(AuthDto.AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .roles(user.getRoles())
                .build());
    }
}
