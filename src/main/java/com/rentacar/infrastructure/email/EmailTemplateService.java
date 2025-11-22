package com.rentacar.infrastructure.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;

/**
 * Email Template Service zum Rendern von HTML-Emails mit Thymeleaf.
 * Unterstützt asynchrones Versenden von Template-basierten Emails.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailTemplateService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from:noreply@rentacar.com}")
    private String fromEmail;

    @Value("${app.mail.from-name:RentACar}")
    private String fromName;

    @Async
    public void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);

            // Render template
            Context context = new Context();
            context.setVariables(variables);
            String htmlContent = templateEngine.process("email/" + templateName, context);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Template email '{}' sent to: {}", templateName, to);
        } catch (MessagingException e) {
            log.error("Failed to send template email '{}' to: {}", templateName, to, e);
        } catch (Exception e) {
            log.error("Unexpected error sending email to: {}", to, e);
        }
    }

    @Async
    public void sendBookingConfirmation(String to, Map<String, Object> bookingDetails) {
        sendTemplateEmail(to, "Buchungsbestätigung - RentACar", "booking-confirmation", bookingDetails);
    }

    @Async
    public void sendBookingCancellation(String to, Map<String, Object> cancellationDetails) {
        sendTemplateEmail(to, "Buchungsstornierung - RentACar", "booking-cancellation", cancellationDetails);
    }

    @Async
    public void sendRentalReminder(String to, Map<String, Object> rentalDetails) {
        sendTemplateEmail(to, "Erinnerung: Ihre Fahrzeugabholung - RentACar", "rental-reminder", rentalDetails);
    }
}
