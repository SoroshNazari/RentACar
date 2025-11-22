package com.rentacar.infrastructure.security.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentacar.infrastructure.security.CustomUserDetailsService;
import com.rentacar.infrastructure.security.JwtService;
import com.rentacar.infrastructure.security.api.dto.AuthDto;
import com.rentacar.infrastructure.security.domain.User;
import com.rentacar.infrastructure.security.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = AuthController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        UserDetailsServiceAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @Test
    void login_shouldReturnTokenAndUserInfo() throws Exception {
        // Given
        AuthDto.LoginRequest request = new AuthDto.LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        User user = User.builder()
                .username("testuser")
                .password("encodedPassword")
                .roles("CUSTOMER")
                .enabled(true)
                .build();

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("testuser")
                .password("encodedPassword")
                .roles("CUSTOMER")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("jwt-token-123");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-123"))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.roles").value("CUSTOMER"));

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService).generateToken(userDetails);
    }

    @Test
    void register_shouldCreateUserAndReturnToken() throws Exception {
        // Given
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("password123");

        User user = User.builder()
                .username("newuser")
                .password("encodedPassword")
                .roles("CUSTOMER")
                .enabled(true)
                .build();

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("newuser")
                .password("encodedPassword")
                .roles("CUSTOMER")
                .build();

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userDetailsService.loadUserByUsername("newuser")).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("jwt-token-456");

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-456"))
                .andExpect(jsonPath("$.username").value("newuser"))
                .andExpect(jsonPath("$.roles").value("CUSTOMER"));

        verify(userRepository).save(any(User.class));
        verify(jwtService).generateToken(userDetails);
    }

    @Test
    void register_withExistingUsername_shouldReturnBadRequest() throws Exception {
        // Given
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setUsername("existinguser");
        request.setPassword("password123");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(userRepository, never()).save(any(User.class));
    }
}
