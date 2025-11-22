package com.rentacar.infrastructure.security;

import com.rentacar.infrastructure.security.domain.User;
import com.rentacar.infrastructure.security.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    void loadUserByUsername_shouldReturnUserDetails() {
        // Given
        User user = User.builder()
                .username("testuser")
                .password("encodedPassword")
                .roles("ADMIN,USER")
                .enabled(true)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        // When
        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        // Then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("testuser");
        assertThat(userDetails.getPassword()).isEqualTo("encodedPassword");
        assertThat(userDetails.getAuthorities()).hasSize(2);
        assertThat(userDetails.isEnabled()).isTrue();
    }

    @Test
    void loadUserByUsername_withSingleRole_shouldReturnUserDetails() {
        // Given
        User user = User.builder()
                .username("customer")
                .password("password")
                .roles("CUSTOMER")
                .enabled(true)
                .build();

        when(userRepository.findByUsername("customer")).thenReturn(Optional.of(user));

        // When
        UserDetails userDetails = userDetailsService.loadUserByUsername("customer");

        // Then
        assertThat(userDetails.getAuthorities()).hasSize(1);
        assertThat(userDetails.getAuthorities().iterator().next().getAuthority())
                .isEqualTo("ROLE_CUSTOMER");
    }

    @Test
    void loadUserByUsername_withDisabledUser_shouldReturnDisabledUserDetails() {
        // Given
        User user = User.builder()
                .username("disableduser")
                .password("password")
                .roles("USER")
                .enabled(false)
                .build();

        when(userRepository.findByUsername("disableduser")).thenReturn(Optional.of(user));

        // When
        UserDetails userDetails = userDetailsService.loadUserByUsername("disableduser");

        // Then
        assertThat(userDetails.isEnabled()).isFalse();
    }

    @Test
    void loadUserByUsername_whenUserNotFound_shouldThrowException() {
        // Given
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("nonexistent"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("not found");
    }
}
