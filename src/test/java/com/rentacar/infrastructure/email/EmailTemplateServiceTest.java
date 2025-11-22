package com.rentacar.infrastructure.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailTemplateServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailTemplateService emailTemplateService;

    @Test
    void sendTemplateEmail_shouldSendEmail() throws MessagingException {
        // Given
        ReflectionTestUtils.setField(emailTemplateService, "fromEmail", "test@rentacar.com");
        ReflectionTestUtils.setField(emailTemplateService, "fromName", "RentACar");

        Map<String, Object> variables = new HashMap<>();
        variables.put("customerName", "Max Mustermann");
        variables.put("bookingId", "BOOK-123");

        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email/test-template"), any(Context.class)))
                .thenReturn("<html><body>Test Email</body></html>");
        doNothing().when(mailSender).send(any(MimeMessage.class));

        // When
        emailTemplateService.sendTemplateEmail("customer@example.com", "Test Subject",
                "test-template", variables);

        // Then
        verify(mailSender, timeout(1000)).send(any(MimeMessage.class));
        verify(templateEngine, timeout(1000)).process(eq("email/test-template"), any(Context.class));
    }

    @Test
    void sendBookingConfirmation_shouldCallSendTemplateEmail() {
        // Given
        ReflectionTestUtils.setField(emailTemplateService, "fromEmail", "test@rentacar.com");
        ReflectionTestUtils.setField(emailTemplateService, "fromName", "RentACar");

        Map<String, Object> bookingDetails = new HashMap<>();
        bookingDetails.put("bookingId", "BOOK-123");

        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(anyString(), any(Context.class)))
                .thenReturn("<html><body>Booking Confirmation</body></html>");

        // When
        emailTemplateService.sendBookingConfirmation("customer@example.com", bookingDetails);

        // Then
        verify(mailSender, timeout(1000)).send(any(MimeMessage.class));
    }

    @Test
    void sendBookingCancellation_shouldCallSendTemplateEmail() {
        // Given
        ReflectionTestUtils.setField(emailTemplateService, "fromEmail", "test@rentacar.com");
        ReflectionTestUtils.setField(emailTemplateService, "fromName", "RentACar");

        Map<String, Object> cancellationDetails = new HashMap<>();
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(anyString(), any(Context.class)))
                .thenReturn("<html><body>Cancellation</body></html>");

        // When
        emailTemplateService.sendBookingCancellation("customer@example.com", cancellationDetails);

        // Then
        verify(mailSender, timeout(1000)).send(any(MimeMessage.class));
    }

    @Test
    void sendRentalReminder_shouldCallSendTemplateEmail() {
        // Given
        ReflectionTestUtils.setField(emailTemplateService, "fromEmail", "test@rentacar.com");
        ReflectionTestUtils.setField(emailTemplateService, "fromName", "RentACar");

        Map<String, Object> rentalDetails = new HashMap<>();
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(anyString(), any(Context.class)))
                .thenReturn("<html><body>Reminder</body></html>");

        // When
        emailTemplateService.sendRentalReminder("customer@example.com", rentalDetails);

        // Then
        verify(mailSender, timeout(1000)).send(any(MimeMessage.class));
    }
}
