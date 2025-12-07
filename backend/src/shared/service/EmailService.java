package de.rentacar.shared.service;

public interface EmailService {
    void sendActivationEmail(String email, String token);
}

