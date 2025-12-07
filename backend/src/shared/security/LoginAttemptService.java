package de.rentacar.shared.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service für Rate Limiting von Login-Versuchen
 * Verhindert Brute-Force-Angriffe durch Begrenzung der Login-Versuche
 */
@Service
@Slf4j
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int BLOCK_DURATION_MINUTES = 15;
    
    // Speichert Login-Versuche pro IP-Adresse
    private final Map<String, LoginAttempt> attemptsByIp = new ConcurrentHashMap<>();
    
    // Speichert Login-Versuche pro Benutzername
    private final Map<String, LoginAttempt> attemptsByUsername = new ConcurrentHashMap<>();

    /**
     * Prüft ob ein Login-Versuch erlaubt ist
     * @param ipAddress IP-Adresse des Clients
     * @param username Benutzername
     * @return true wenn Login erlaubt, false wenn blockiert
     */
    public boolean isAllowed(String ipAddress, String username) {
        // Prüfe IP-basierte Blockierung
        LoginAttempt ipAttempt = attemptsByIp.get(ipAddress);
        if (ipAttempt != null && ipAttempt.isBlocked()) {
            log.warn("Login blockiert für IP {} - zu viele fehlgeschlagene Versuche", ipAddress);
            return false;
        }
        
        // Prüfe Benutzername-basierte Blockierung
        LoginAttempt usernameAttempt = attemptsByUsername.get(username);
        if (usernameAttempt != null && usernameAttempt.isBlocked()) {
            log.warn("Login blockiert für Benutzer {} - zu viele fehlgeschlagene Versuche", username);
            return false;
        }
        
        return true;
    }

    /**
     * Registriert einen fehlgeschlagenen Login-Versuch
     * @param ipAddress IP-Adresse des Clients
     * @param username Benutzername
     */
    public void recordFailedAttempt(String ipAddress, String username) {
        LocalDateTime now = LocalDateTime.now();
        
        // IP-basierte Blockierung
        LoginAttempt ipAttempt = attemptsByIp.computeIfAbsent(ipAddress, 
            k -> new LoginAttempt());
        ipAttempt.increment(now);
        if (ipAttempt.getAttemptCount() >= MAX_ATTEMPTS) {
            ipAttempt.setBlockedUntil(now.plusMinutes(BLOCK_DURATION_MINUTES));
            log.warn("IP {} für {} Minuten blockiert nach {} fehlgeschlagenen Login-Versuchen", 
                ipAddress, BLOCK_DURATION_MINUTES, MAX_ATTEMPTS);
        }
        
        // Benutzername-basierte Blockierung
        LoginAttempt usernameAttempt = attemptsByUsername.computeIfAbsent(username, 
            k -> new LoginAttempt());
        usernameAttempt.increment(now);
        if (usernameAttempt.getAttemptCount() >= MAX_ATTEMPTS) {
            usernameAttempt.setBlockedUntil(now.plusMinutes(BLOCK_DURATION_MINUTES));
            log.warn("Benutzer {} für {} Minuten blockiert nach {} fehlgeschlagenen Login-Versuchen", 
                username, BLOCK_DURATION_MINUTES, MAX_ATTEMPTS);
        }
    }

    /**
     * Registriert einen erfolgreichen Login-Versuch und setzt Zähler zurück
     * @param ipAddress IP-Adresse des Clients
     * @param username Benutzername
     */
    public void recordSuccessfulAttempt(String ipAddress, String username) {
        attemptsByIp.remove(ipAddress);
        attemptsByUsername.remove(username);
    }

    /**
     * Bereinigt abgelaufene Blockierungen
     */
    public void cleanup() {
        LocalDateTime now = LocalDateTime.now();
        attemptsByIp.entrySet().removeIf(entry -> 
            entry.getValue().getBlockedUntil() != null && 
            entry.getValue().getBlockedUntil().isBefore(now) &&
            entry.getValue().getAttemptCount() < MAX_ATTEMPTS);
        attemptsByUsername.entrySet().removeIf(entry -> 
            entry.getValue().getBlockedUntil() != null && 
            entry.getValue().getBlockedUntil().isBefore(now) &&
            entry.getValue().getAttemptCount() < MAX_ATTEMPTS);
    }

    /**
     * Innere Klasse für Login-Versuche
     */
    private static class LoginAttempt {
        private int attemptCount = 0;
        private LocalDateTime lastAttempt;
        private LocalDateTime blockedUntil;

        public void increment(LocalDateTime now) {
            this.attemptCount++;
            this.lastAttempt = now;
        }

        public boolean isBlocked() {
            if (blockedUntil == null) {
                return false;
            }
            // Wenn Blockierung abgelaufen ist, zurücksetzen
            if (blockedUntil.isBefore(LocalDateTime.now())) {
                attemptCount = 0;
                blockedUntil = null;
                return false;
            }
            return attemptCount >= MAX_ATTEMPTS;
        }

        public int getAttemptCount() {
            return attemptCount;
        }

        public LocalDateTime getLastAttempt() {
            return lastAttempt;
        }

        public LocalDateTime getBlockedUntil() {
            return blockedUntil;
        }

        public void setBlockedUntil(LocalDateTime blockedUntil) {
            this.blockedUntil = blockedUntil;
        }
    }
}


