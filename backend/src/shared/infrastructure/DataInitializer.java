package de.rentacar.shared.infrastructure;

import de.rentacar.customer.application.CustomerService;
import de.rentacar.shared.security.Role;
import de.rentacar.shared.security.User;
import de.rentacar.shared.security.UserRepository;
import de.rentacar.vehicle.application.VehicleManagementService;
import de.rentacar.vehicle.domain.VehicleRepository;
import de.rentacar.vehicle.domain.VehicleType;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Initialisiert umfangreiche Testdaten beim Start der Anwendung
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomerService customerService;
    private final VehicleManagementService vehicleManagementService;

    @Override
    public void run(String... args) {
        initializeUsers();
        initializeVehicles();
        normalizeVehicleGalleries();
        initializeCustomers();
        // Optional: initializeBookings(); // Kann später aktiviert werden
    }

    private void initializeUsers() {
        // Admin User
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .roles(Set.of(Role.ROLE_ADMIN))
                    .enabled(true)
                    .build();
            userRepository.save(admin);
        }

        // Employee User
        if (userRepository.findByUsername("employee").isEmpty()) {
            User employee = User.builder()
                    .username("employee")
                    .password(passwordEncoder.encode("employee123"))
                    .roles(Set.of(Role.ROLE_EMPLOYEE))
                    .enabled(true)
                    .build();
            userRepository.save(employee);
        }

        // Customer User (wird auch als Customer erstellt)
        if (userRepository.findByUsername("customer").isEmpty()) {
            User customer = User.builder()
                    .username("customer")
                    .password(passwordEncoder.encode("customer123"))
                    .roles(Set.of(Role.ROLE_CUSTOMER))
                    .enabled(true)
                    .build();
            userRepository.save(customer);
        }
    }

    private void initializeVehicles() {
        if (vehicleRepository.findAll().isEmpty()) {
            seedVehicles();
        }
    }

    public void resetVehicles() {
        try {
            vehicleRepository.deleteAll();
        } catch (Exception e) {
            throw new RuntimeException("Konnte Fahrzeuge nicht löschen", e);
        }
        seedVehicles();
    }

    private void seedVehicles() {
        // Berlin Fahrzeuge
        createVehicle("B-AB 1234", "BMW", "3er 320d", VehicleType.MITTELKLASSE, 2018, 50000L, "Berlin", 60.0);
        createVehicle("B-CD 5678", "Audi", "Q5", VehicleType.SUV, 2019, 60000L, "Berlin", 80.0);
        createVehicle("B-EF 9012", "Mercedes-Benz", "E-Klasse", VehicleType.OBERKLASSE, 2018, 45000L, "Berlin", 95.0);
        createVehicle("B-GH 3456", "Volkswagen", "Golf", VehicleType.KOMPAKTKLASSE, 2017, 35000L, "Berlin", 45.0);
        createVehicle("B-IJ 7890", "BMW", "X3", VehicleType.SUV, 2019, 55000L, "Berlin", 85.0);
        createVehicle("B-KL 2468", "Audi", "A4", VehicleType.MITTELKLASSE, 2018, 40000L, "Berlin", 65.0);
        createVehicle("B-MN 1357", "Mercedes-Benz", "C-Klasse", VehicleType.MITTELKLASSE, 2017, 38000L, "Berlin", 70.0);
        createVehicle("B-OP 8024", "Volkswagen", "Polo", VehicleType.KLEINWAGEN, 2020, 25000L, "Berlin", 35.0);
        createVehicle("B-QR 4680", "BMW", "i3", VehicleType.KOMPAKTKLASSE, 2018, 20000L, "Berlin", 50.0);
        createVehicle("B-ST 9753", "Audi", "TT", VehicleType.SPORTWAGEN, 2016, 30000L, "Berlin", 120.0);

        // München Fahrzeuge
        createVehicle("M-AB 1234", "Mercedes-Benz", "C-Klasse 220", VehicleType.MITTELKLASSE, 2017, 30000L, "München", 65.0);
        createVehicle("M-CD 5678", "BMW", "5er 520d", VehicleType.OBERKLASSE, 2018, 50000L, "München", 90.0);
        createVehicle("M-EF 9012", "Audi", "A6", VehicleType.OBERKLASSE, 2019, 55000L, "München", 100.0);
        createVehicle("M-GH 3456", "Mercedes-Benz", "GLC", VehicleType.SUV, 2019, 40000L, "München", 95.0);
        createVehicle("M-IJ 7890", "BMW", "X5", VehicleType.SUV, 2020, 60000L, "München", 110.0);
        createVehicle("M-KL 2468", "Volkswagen", "Passat", VehicleType.MITTELKLASSE, 2018, 45000L, "München", 55.0);
        createVehicle("M-MN 1357", "Audi", "A3", VehicleType.KOMPAKTKLASSE, 2017, 30000L, "München", 50.0);
        createVehicle("M-OP 8024", "Mercedes-Benz", "A-Klasse", VehicleType.KOMPAKTKLASSE, 2018, 25000L, "München", 48.0);
        createVehicle("M-QR 4680", "BMW", "1er", VehicleType.KOMPAKTKLASSE, 2017, 28000L, "München", 45.0);
        createVehicle("M-ST 9753", "Porsche", "911", VehicleType.SPORTWAGEN, 2015, 15000L, "München", 250.0);

        // Hamburg Fahrzeuge
        createVehicle("H-AB 1234", "Volkswagen", "Golf", VehicleType.KOMPAKTKLASSE, 2016, 40000L, "Hamburg", 40.0);
        createVehicle("H-CD 5678", "BMW", "3er 320i", VehicleType.MITTELKLASSE, 2017, 45000L, "Hamburg", 58.0);
        createVehicle("H-EF 9012", "Mercedes-Benz", "CLA", VehicleType.MITTELKLASSE, 2018, 35000L, "Hamburg", 62.0);
        createVehicle("H-GH 3456", "Audi", "Q3", VehicleType.SUV, 2018, 38000L, "Hamburg", 75.0);
        createVehicle("H-IJ 7890", "Volkswagen", "Tiguan", VehicleType.SUV, 2019, 50000L, "Hamburg", 70.0);
        createVehicle("H-KL 2468", "BMW", "X1", VehicleType.SUV, 2017, 42000L, "Hamburg", 68.0);
        createVehicle("H-MN 1357", "Mercedes-Benz", "B-Klasse", VehicleType.VAN, 2016, 30000L, "Hamburg", 55.0);
        createVehicle("H-OP 8024", "Volkswagen", "Touran", VehicleType.VAN, 2017, 45000L, "Hamburg", 60.0);
        createVehicle("H-QR 4680", "Audi", "A1", VehicleType.KLEINWAGEN, 2018, 20000L, "Hamburg", 38.0);
        createVehicle("H-ST 9753", "BMW", "Z4", VehicleType.SPORTWAGEN, 2015, 25000L, "Hamburg", 130.0);

        // Frankfurt Fahrzeuge
        createVehicle("F-AB 1234", "Audi", "A5", VehicleType.OBERKLASSE, 2019, 40000L, "Frankfurt", 85.0);
        createVehicle("F-CD 5678", "BMW", "4er 430d", VehicleType.OBERKLASSE, 2019, 45000L, "Frankfurt", 88.0);
        createVehicle("F-EF 9012", "Mercedes-Benz", "S-Klasse", VehicleType.OBERKLASSE, 2020, 60000L, "Frankfurt", 150.0);
        createVehicle("F-GH 3456", "BMW", "X7", VehicleType.SUV, 2020, 50000L, "Frankfurt", 130.0);
        createVehicle("F-IJ 7890", "Audi", "Q7", VehicleType.SUV, 2019, 55000L, "Frankfurt", 120.0);
        createVehicle("F-KL 2468", "Mercedes-Benz", "V-Klasse", VehicleType.VAN, 2018, 40000L, "Frankfurt", 85.0);
        createVehicle("F-MN 1357", "Volkswagen", "Arteon", VehicleType.OBERKLASSE, 2018, 35000L, "Frankfurt", 75.0);
        createVehicle("F-OP 8024", "BMW", "iX", VehicleType.SUV, 2021, 20000L, "Frankfurt", 95.0);
        createVehicle("F-QR 4680", "Audi", "e-tron", VehicleType.SUV, 2021, 15000L, "Frankfurt", 90.0);
        createVehicle("F-ST 9753", "Porsche", "Cayenne", VehicleType.SUV, 2018, 30000L, "Frankfurt", 180.0);

        // Köln Fahrzeuge
        createVehicle("K-AB 1234", "Volkswagen", "ID.3", VehicleType.KOMPAKTKLASSE, 2021, 10000L, "Köln", 55.0);
        createVehicle("K-CD 5678", "BMW", "i4", VehicleType.MITTELKLASSE, 2022, 8000L, "Köln", 70.0);
        createVehicle("K-EF 9012", "Mercedes-Benz", "EQC", VehicleType.SUV, 2021, 12000L, "Köln", 85.0);
        createVehicle("K-GH 3456", "Audi", "e-tron GT", VehicleType.OBERKLASSE, 2021, 5000L, "Köln", 140.0);
        createVehicle("K-IJ 7890", "Volkswagen", "ID.4", VehicleType.SUV, 2021, 15000L, "Köln", 65.0);
        createVehicle("K-KL 2468", "BMW", "3er", VehicleType.MITTELKLASSE, 2017, 40000L, "Köln", 60.0);
        createVehicle("K-MN 1357", "Mercedes-Benz", "GLA", VehicleType.SUV, 2018, 35000L, "Köln", 72.0);
        createVehicle("K-OP 8024", "Audi", "A4 Avant", VehicleType.MITTELKLASSE, 2017, 45000L, "Köln", 68.0);
        createVehicle("K-QR 4680", "Volkswagen", "T-Cross", VehicleType.SUV, 2019, 30000L, "Köln", 58.0);
        createVehicle("K-ST 9753", "BMW", "M3", VehicleType.SPORTWAGEN, 2018, 20000L, "Köln", 200.0);
    }

    private void createVehicle(String licensePlate, String brand, String model,
                               VehicleType type, Integer year, Long mileage, String location, Double dailyPrice) {
        try {
            String imageUrl = getVehicleImageUrl(brand, model, type);
            java.util.List<String> gallery = getVehicleImageGallery(brand, model, type);
            vehicleManagementService.addVehicle(
                    licensePlate, brand, model, type, year, mileage, location, dailyPrice, imageUrl, gallery,
                    "admin", "127.0.0.1"
            );
        } catch (Exception e) {
            // Ignoriere wenn Fahrzeug bereits existiert
            System.out.println("Fahrzeug " + licensePlate + " konnte nicht erstellt werden: " + e.getMessage());
        }
    }

    private String getVehicleImageUrl(String brand, String model, VehicleType type) {
        return switch (type) {
            case KLEINWAGEN -> "/images/vehicle/economy.svg";
            case KOMPAKTKLASSE -> "/images/vehicle/compact.svg";
            case MITTELKLASSE -> "/images/vehicle/midsize.svg";
            case OBERKLASSE -> "/images/vehicle/premium.svg";
            case SUV -> "/images/vehicle/suv.svg";
            case VAN -> "/images/vehicle/van.svg";
            case SPORTWAGEN -> "/images/vehicle/sports.svg";
        };
    }

    private java.util.List<String> getVehicleImageGallery(String brand, String model, VehicleType type) {
        String primary = getVehicleImageUrl(brand, model, type);
        return java.util.List.of(primary, primary, primary);
    }

    private void normalizeVehicleGalleries() {
        var vehicles = vehicleRepository.findAll();
        for (var v : vehicles) {
            try {
                String primary = getVehicleImageUrl(v.getBrand(), v.getModel(), v.getType());
                java.util.List<String> gallery = java.util.List.of(primary, primary, primary);
                vehicleManagementService.updateVehicle(
                        v.getId(),
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        primary,
                        gallery,
                        "admin",
                        "127.0.0.1"
                );
            } catch (Exception ignored) {
            }
        }
    }

    private void initializeCustomers() {
        // Hauptkunde (bereits als User vorhanden)
        try {
            customerService.getCustomerByUsername("customer");
            // Kunde existiert bereits
        } catch (IllegalArgumentException e) {
            // Kunde existiert nicht, erstelle ihn
            try {
                customerService.registerCustomer(
                        "customer", "customer123", "Max", "Mustermann",
                        "max.mustermann@example.com", "+49 30 12345678",
                        "Hauptstraße 123, 10115 Berlin", "B123456789",
                        "127.0.0.1"
                );
            } catch (Exception ex) {
                System.out.println("Kunde 'customer' konnte nicht erstellt werden: " + ex.getMessage());
            }
        }

        // Weitere Test-Kunden
        createCustomer("john.doe", "password123", "John", "Doe",
                "john.doe@example.com", "+49 30 98765432",
                "Unter den Linden 1, 10117 Berlin", "B987654321");

        createCustomer("jane.smith", "password123", "Jane", "Smith",
                "jane.smith@example.com", "+49 89 12345678",
                "Marienplatz 1, 80331 München", "M123456789");

        createCustomer("peter.mueller", "password123", "Peter", "Müller",
                "peter.mueller@example.com", "+49 40 12345678",
                "Speicherstadt 1, 20457 Hamburg", "H123456789");

        createCustomer("sarah.schmidt", "password123", "Sarah", "Schmidt",
                "sarah.schmidt@example.com", "+49 69 12345678",
                "Zeil 1, 60313 Frankfurt", "F123456789");

        createCustomer("thomas.weber", "password123", "Thomas", "Weber",
                "thomas.weber@example.com", "+49 221 12345678",
                "Domstraße 1, 50667 Köln", "K123456789");

        createCustomer("lisa.fischer", "password123", "Lisa", "Fischer",
                "lisa.fischer@example.com", "+49 30 55555555",
                "Potsdamer Platz 1, 10785 Berlin", "B555555555");

        createCustomer("michael.wagner", "password123", "Michael", "Wagner",
                "michael.wagner@example.com", "+49 89 66666666",
                "Maximilianstraße 1, 80539 München", "M666666666");

        createCustomer("anna.becker", "password123", "Anna", "Becker",
                "anna.becker@example.com", "+49 40 77777777",
                "Jungfernstieg 1, 20095 Hamburg", "H777777777");
    }

    private void createCustomer(String username, String password, String firstName, String lastName,
                               String email, String phone, String address, String driverLicense) {
        try {
            customerService.registerCustomer(
                    username, password, firstName, lastName,
                    email, phone, address, driverLicense,
                    "127.0.0.1"
            );
        } catch (Exception e) {
            // Ignoriere wenn bereits vorhanden
            System.out.println("Kunde " + username + " konnte nicht erstellt werden: " + e.getMessage());
        }
    }

    // Optional: Test-Buchungen erstellen (kann später aktiviert werden)
    /*
    private void initializeBookings() {
        try {
            // Beispiel: Kunde bucht ein Fahrzeug
            var customer = customerService.getCustomerByUsername("customer");
            var vehicles = vehicleRepository.findAll();
            if (!vehicles.isEmpty() && customer != null) {
                var vehicle = vehicles.get(0);
                LocalDate pickupDate = LocalDate.now().plusDays(1);
                LocalDate returnDate = pickupDate.plusDays(3);
                
                bookingService.createBooking(
                        customer.getId(),
                        vehicle.getId(),
                        pickupDate,
                        returnDate,
                        vehicle.getLocation(),
                        vehicle.getLocation(),
                        "customer",
                        "127.0.0.1"
                );
            }
        } catch (Exception e) {
            System.out.println("Buchung konnte nicht erstellt werden: " + e.getMessage());
        }
    }
    */
}
