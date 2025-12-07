package de.rentacar.shared.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Dummy-Implementierung des EmailService für Entwicklung
 * Loggt E-Mail-Details in die Konsole statt tatsächlich E-Mails zu versenden
 */
@Service
@Slf4j
public class DummyEmailService implements EmailService {

    @Override
    public void sendActivationEmail(String email, String token) {
        log.info("=== E-MAIL-VERSAND (DUMMY) ===");
        log.info("An: {}", email);
        log.info("Betreff: Account-Aktivierung für RentACar");
        log.info("Aktivierungstoken: {}", token);
        log.info("Aktivierungs-Link: http://localhost:3000/activate?token={}", token);
        log.info("=== ENDE E-MAIL ===");
    }
}


