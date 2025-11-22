package com.rentacar.infrastructure.email;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    void sendBookingConfirmation_shouldSendEmail() {
        // Given
        String to = "customer@example.com";
        String customerName = "Max Mustermann";
        String bookingId = "BOOK-123";

        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // When
        emailService.sendBookingConfirmation(to, customerName, bookingId);

        // Then
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, timeout(1000)).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();
        assertThat(sentMessage.getTo()).containsExactly(to);
        assertThat(sentMessage.getSubject()).contains("Buchungsbestätigung");
        assertThat(sentMessage.getText()).contains(customerName);
        assertThat(sentMessage.getText()).contains(bookingId);
    }

    @Test
    void sendBookingCancellation_shouldSendEmail() {
        // Given
        String to = "customer@example.com";
        String customerName = "Max Mustermann";
        String bookingId = "BOOK-123";

        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // When
        emailService.sendBookingCancellation(to, customerName, bookingId);

        // Then
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, timeout(1000)).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();
        assertThat(sentMessage.getTo()).containsExactly(to);
        assertThat(sentMessage.getSubject()).contains("Buchungsstornierung");
        assertThat(sentMessage.getText()).contains(customerName);
        assertThat(sentMessage.getText()).contains(bookingId);
    }

    @Test
    void sendRentalReminder_shouldSendEmail() {
        // Given
        String to = "customer@example.com";
        String customerName = "Max Mustermann";
        String rentalDate = "2025-12-01";

        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // When
        emailService.sendRentalReminder(to, customerName, rentalDate);

        // Then
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, timeout(1000)).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();
        assertThat(sentMessage.getTo()).containsExactly(to);
        assertThat(sentMessage.getSubject()).contains("Erinnerung");
        assertThat(sentMessage.getText()).contains(customerName);
        assertThat(sentMessage.getText()).contains(rentalDate);
    }

    @Test
    void sendBookingConfirmation_whenMailSenderFails_shouldNotThrowException() {
        // Given
        doThrow(new RuntimeException("SMTP error")).when(mailSender).send(any(SimpleMailMessage.class));

        // When & Then - should not throw
        emailService.sendBookingConfirmation("test@example.com", "Test", "BOOK-1");

        verify(mailSender, timeout(1000)).send(any(SimpleMailMessage.class));
    }
}
