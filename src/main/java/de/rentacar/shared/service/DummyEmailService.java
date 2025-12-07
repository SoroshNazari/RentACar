package de.rentacar.shared.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DummyEmailService implements EmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DummyEmailService.class);

    @Override
    public void sendActivationEmail(String email, String token) {
        LOGGER.info("Sending activation email to {} with token {}", email, token);
    }
}
