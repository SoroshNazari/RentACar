package de.rentacar.customer.application;

import de.rentacar.customer.domain.Customer;
import de.rentacar.customer.domain.CustomerRepository;
import de.rentacar.customer.domain.EncryptedString;
import de.rentacar.customer.infrastructure.EncryptionService;
import de.rentacar.shared.domain.AuditService;
import de.rentacar.shared.security.Role;
import de.rentacar.shared.security.User;
import de.rentacar.shared.security.UserRepository;
import de.rentacar.shared.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Set;

/**
 * Application Service für Kundenverwaltung (Use Cases)
 */
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final EncryptionService encryptionService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final EmailService emailService;

    /**
     * Use Case: Kunde registrieren
     */
    @Transactional
    public Customer registerCustomer(String username, String password, String firstName, 
                                    String lastName, String email, String phone, 
                                    String address, String driverLicenseNumber,
                                    String ipAddress) {
        // Prüfe ob Benutzername bereits existiert
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Benutzername bereits vergeben");
        }

        // Generiere Aktivierungstoken
        String activationToken = generateActivationToken();
        
        // Erstelle User für Spring Security (standardmäßig deaktiviert)
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .roles(Set.of(Role.ROLE_CUSTOMER))
                .enabled(false) // Account muss per E-Mail aktiviert werden
                .activationToken(activationToken)
                .build();
        userRepository.save(user);

        // Verschlüssele sensible Daten (DSGVO-konform)
        EncryptedString encryptedEmail = EncryptedString.of(encryptionService.encrypt(email));
        EncryptedString encryptedPhone = EncryptedString.of(encryptionService.encrypt(phone));
        EncryptedString encryptedAddress = EncryptedString.of(encryptionService.encrypt(address));
        EncryptedString encryptedLicense = EncryptedString.of(encryptionService.encrypt(driverLicenseNumber));

        Customer customer = Customer.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .email(encryptedEmail)
                .phone(encryptedPhone)
                .address(encryptedAddress)
                .driverLicenseNumber(encryptedLicense)
                .build();

        Customer savedCustomer = customerRepository.save(customer);

        // Sende Aktivierungs-E-Mail
        emailService.sendActivationEmail(email, activationToken);

        auditService.logAction(username, "CUSTOMER_REGISTERED", "Customer", 
                savedCustomer.getId().toString(), 
                "Kunde registriert",
                ipAddress);

        return savedCustomer;
    }

    /**
     * Use Case: Account aktivieren
     */
    @Transactional
    public void activateCustomer(String activationToken) {
        User user = userRepository.findByActivationToken(activationToken)
                .orElseThrow(() -> new IllegalArgumentException("Ungültiger Aktivierungstoken"));

        if (user.isEnabled()) {
            throw new IllegalArgumentException("Account ist bereits aktiviert");
        }

        user.setEnabled(true);
        user.setActivationToken(null); // Token nach Aktivierung löschen
        userRepository.save(user);
    }

    /**
     * Holt den Aktivierungstoken für einen Benutzer (für Entwicklung)
     */
    @Transactional(readOnly = true)
    public String getActivationTokenForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Benutzer nicht gefunden"));
        return user.getActivationToken();
    }

    /**
     * Generiert einen sicheren Aktivierungstoken
     */
    private String generateActivationToken() {
        SecureRandom random = new SecureRandom();
        byte[] tokenBytes = new byte[32];
        random.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    /**
     * Use Case: Kundendaten aktualisieren
     */
    @Transactional
    public Customer updateCustomerData(Long customerId, String firstName, String lastName, 
                                      String email, String phone, String address,
                                      String username, String ipAddress) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Kunde nicht gefunden"));

        // Verschlüssele neue Daten
        EncryptedString encryptedEmail = email != null ? 
                EncryptedString.of(encryptionService.encrypt(email)) : null;
        EncryptedString encryptedPhone = phone != null ? 
                EncryptedString.of(encryptionService.encrypt(phone)) : null;
        EncryptedString encryptedAddress = address != null ? 
                EncryptedString.of(encryptionService.encrypt(address)) : null;

        customer.updatePersonalData(firstName, lastName, encryptedEmail, encryptedPhone, encryptedAddress);
        
        Customer savedCustomer = customerRepository.save(customer);

        auditService.logAction(username, "CUSTOMER_UPDATED", "Customer", 
                customerId.toString(), 
                "Kundendaten aktualisiert",
                ipAddress);

        return savedCustomer;
    }

    /**
     * Use Case: Kunde nach ID abrufen
     */
    @Transactional(readOnly = true)
    public Customer getCustomerById(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Kunde nicht gefunden"));
    }

    /**
     * Use Case: Kunde nach Benutzername abrufen
     */
    @Transactional(readOnly = true)
    public Customer getCustomerByUsername(String username) {
        return customerRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Kunde nicht gefunden"));
    }

    /**
     * Use Case: Alle Kunden abrufen (für Mitarbeiter/Admin)
     */
    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }
}

