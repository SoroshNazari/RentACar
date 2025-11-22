package com.rentacar.infrastructure.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email Service for sending notifications.
 * Uses async processing to avoid blocking.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendBookingConfirmation(String to, String customerName, String bookingId) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Buchungsbestätigung - RentACar");
            message.setText(String.format(
                    "Hallo %s,\n\n" +
                            "Ihre Buchung wurde erfolgreich erstellt!\n\n" +
                            "Buchungsnummer: %s\n\n" +
                            "Vielen Dank für Ihre Buchung bei RentACar.\n\n" +
                            "Mit freundlichen Grüßen,\n" +
                            "Ihr RentACar Team",
                    customerName, bookingId));

            mailSender.send(message);
            log.info("Booking confirmation email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send booking confirmation email to: {}", to, e);
        }
    }

    @Async
    public void sendBookingCancellation(String to, String customerName, String bookingId) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Buchungsstornierung - RentACar");
            message.setText(String.format(
                    "Hallo %s,\n\n" +
                            "Ihre Buchung wurde storniert.\n\n" +
                            "Buchungsnummer: %s\n\n" +
                            "Bei Fragen stehen wir Ihnen gerne zur Verfügung.\n\n" +
                            "Mit freundlichen Grüßen,\n" +
                            "Ihr RentACar Team",
                    customerName, bookingId));

            mailSender.send(message);
            log.info("Booking cancellation email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send cancellation email to: {}", to, e);
        }
    }

    @Async
    public void sendRentalReminder(String to, String customerName, String rentalDate) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Erinnerung: Ihre Fahrzeugabholung - RentACar");
            message.setText(String.format(
                    "Hallo %s,\n\n" +
                            "Dies ist eine Erinnerung an Ihre bevorstehende Fahrzeugabholung am %s.\n\n" +
                            "Bitte bringen Sie Ihren Führerschein und einen gültigen Ausweis mit.\n\n" +
                            "Wir freuen uns auf Ihren Besuch!\n\n" +
                            "Mit freundlichen Grüßen,\n" +
                            "Ihr RentACar Team",
                    customerName, rentalDate));

            mailSender.send(message);
            log.info("Rental reminder email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send rental reminder email to: {}", to, e);
        }
    }
}
