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
            // Berlin Fahrzeuge
            createVehicle("B-AB 1234", "BMW", "320d", VehicleType.MITTELKLASSE, 50000L, "Berlin", 60.0);
            createVehicle("B-CD 5678", "Audi", "Q5", VehicleType.SUV, 60000L, "Berlin", 80.0);
            createVehicle("B-EF 9012", "Mercedes", "E-Klasse", VehicleType.OBERKLASSE, 45000L, "Berlin", 95.0);
            createVehicle("B-GH 3456", "VW", "Golf", VehicleType.KOMPAKTKLASSE, 35000L, "Berlin", 45.0);
            createVehicle("B-IJ 7890", "BMW", "X3", VehicleType.SUV, 55000L, "Berlin", 85.0);
            createVehicle("B-KL 2468", "Audi", "A4", VehicleType.MITTELKLASSE, 40000L, "Berlin", 65.0);
            createVehicle("B-MN 1357", "Mercedes", "C-Klasse", VehicleType.MITTELKLASSE, 38000L, "Berlin", 70.0);
            createVehicle("B-OP 8024", "VW", "Polo", VehicleType.KLEINWAGEN, 25000L, "Berlin", 35.0);
            createVehicle("B-QR 4680", "BMW", "i3", VehicleType.KOMPAKTKLASSE, 20000L, "Berlin", 50.0);
            createVehicle("B-ST 9753", "Audi", "TT", VehicleType.SPORTWAGEN, 30000L, "Berlin", 120.0);

            // München Fahrzeuge
            createVehicle("M-AB 1234", "Mercedes", "C220", VehicleType.MITTELKLASSE, 30000L, "München", 65.0);
            createVehicle("M-CD 5678", "BMW", "520d", VehicleType.OBERKLASSE, 50000L, "München", 90.0);
            createVehicle("M-EF 9012", "Audi", "A6", VehicleType.OBERKLASSE, 55000L, "München", 100.0);
            createVehicle("M-GH 3456", "Mercedes", "GLC", VehicleType.SUV, 40000L, "München", 95.0);
            createVehicle("M-IJ 7890", "BMW", "X5", VehicleType.SUV, 60000L, "München", 110.0);
            createVehicle("M-KL 2468", "VW", "Passat", VehicleType.MITTELKLASSE, 45000L, "München", 55.0);
            createVehicle("M-MN 1357", "Audi", "A3", VehicleType.KOMPAKTKLASSE, 30000L, "München", 50.0);
            createVehicle("M-OP 8024", "Mercedes", "A-Klasse", VehicleType.KOMPAKTKLASSE, 25000L, "München", 48.0);
            createVehicle("M-QR 4680", "BMW", "1er", VehicleType.KOMPAKTKLASSE, 28000L, "München", 45.0);
            createVehicle("M-ST 9753", "Porsche", "911", VehicleType.SPORTWAGEN, 15000L, "München", 250.0);

            // Hamburg Fahrzeuge
            createVehicle("H-AB 1234", "VW", "Golf", VehicleType.KOMPAKTKLASSE, 40000L, "Hamburg", 40.0);
            createVehicle("H-CD 5678", "BMW", "320i", VehicleType.MITTELKLASSE, 45000L, "Hamburg", 58.0);
            createVehicle("H-EF 9012", "Mercedes", "CLA", VehicleType.MITTELKLASSE, 35000L, "Hamburg", 62.0);
            createVehicle("H-GH 3456", "Audi", "Q3", VehicleType.SUV, 38000L, "Hamburg", 75.0);
            createVehicle("H-IJ 7890", "VW", "Tiguan", VehicleType.SUV, 50000L, "Hamburg", 70.0);
            createVehicle("H-KL 2468", "BMW", "X1", VehicleType.SUV, 42000L, "Hamburg", 68.0);
            createVehicle("H-MN 1357", "Mercedes", "B-Klasse", VehicleType.VAN, 30000L, "Hamburg", 55.0);
            createVehicle("H-OP 8024", "VW", "Touran", VehicleType.VAN, 45000L, "Hamburg", 60.0);
            createVehicle("H-QR 4680", "Audi", "A1", VehicleType.KLEINWAGEN, 20000L, "Hamburg", 38.0);
            createVehicle("H-ST 9753", "BMW", "Z4", VehicleType.SPORTWAGEN, 25000L, "Hamburg", 130.0);

            // Frankfurt Fahrzeuge
            createVehicle("F-AB 1234", "Audi", "A5", VehicleType.OBERKLASSE, 40000L, "Frankfurt", 85.0);
            createVehicle("F-CD 5678", "BMW", "430d", VehicleType.OBERKLASSE, 45000L, "Frankfurt", 88.0);
            createVehicle("F-EF 9012", "Mercedes", "S-Klasse", VehicleType.OBERKLASSE, 60000L, "Frankfurt", 150.0);
            createVehicle("F-GH 3456", "BMW", "X7", VehicleType.SUV, 50000L, "Frankfurt", 130.0);
            createVehicle("F-IJ 7890", "Audi", "Q7", VehicleType.SUV, 55000L, "Frankfurt", 120.0);
            createVehicle("F-KL 2468", "Mercedes", "V-Klasse", VehicleType.VAN, 40000L, "Frankfurt", 85.0);
            createVehicle("F-MN 1357", "VW", "Arteon", VehicleType.OBERKLASSE, 35000L, "Frankfurt", 75.0);
            createVehicle("F-OP 8024", "BMW", "iX", VehicleType.SUV, 20000L, "Frankfurt", 95.0);
            createVehicle("F-QR 4680", "Audi", "e-tron", VehicleType.SUV, 15000L, "Frankfurt", 90.0);
            createVehicle("F-ST 9753", "Porsche", "Cayenne", VehicleType.SUV, 30000L, "Frankfurt", 180.0);

            // Köln Fahrzeuge
            createVehicle("K-AB 1234", "VW", "ID.3", VehicleType.KOMPAKTKLASSE, 10000L, "Köln", 55.0);
            createVehicle("K-CD 5678", "BMW", "i4", VehicleType.MITTELKLASSE, 8000L, "Köln", 70.0);
            createVehicle("K-EF 9012", "Mercedes", "EQC", VehicleType.SUV, 12000L, "Köln", 85.0);
            createVehicle("K-GH 3456", "Audi", "e-tron GT", VehicleType.OBERKLASSE, 5000L, "Köln", 140.0);
            createVehicle("K-IJ 7890", "VW", "ID.4", VehicleType.SUV, 15000L, "Köln", 65.0);
            createVehicle("K-KL 2468", "BMW", "3er", VehicleType.MITTELKLASSE, 40000L, "Köln", 60.0);
            createVehicle("K-MN 1357", "Mercedes", "GLA", VehicleType.SUV, 35000L, "Köln", 72.0);
            createVehicle("K-OP 8024", "Audi", "A4 Avant", VehicleType.MITTELKLASSE, 45000L, "Köln", 68.0);
            createVehicle("K-QR 4680", "VW", "T-Cross", VehicleType.SUV, 30000L, "Köln", 58.0);
            createVehicle("K-ST 9753", "BMW", "M3", VehicleType.SPORTWAGEN, 20000L, "Köln", 200.0);
        }
    }

    private void createVehicle(String licensePlate, String brand, String model, 
                               VehicleType type, Long mileage, String location, Double dailyPrice) {
        try {
            String imageUrl = getVehicleImageUrl(brand, model, type);
            vehicleManagementService.addVehicle(
                    licensePlate, brand, model, type, mileage, location, dailyPrice, imageUrl,
                    "admin", "127.0.0.1"
            );
        } catch (Exception e) {
            // Ignoriere wenn Fahrzeug bereits existiert
            System.out.println("Fahrzeug " + licensePlate + " konnte nicht erstellt werden: " + e.getMessage());
        }
    }

    private String getVehicleImageUrl(String brand, String model, VehicleType type) {
        // Spezifische Bilder für jedes Modell - verschiedene Unsplash-IDs für bessere Vielfalt
        String brandLower = brand.toLowerCase();
        String modelLower = model.toLowerCase();
        
        // BMW Modelle - verschiedene Bilder für verschiedene Modelle
        if (brandLower.equals("bmw")) {
            if (modelLower.contains("320") || modelLower.contains("3er")) {
                return "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&auto=format"; // BMW 3er Sedan
            } else if (modelLower.equals("i3")) {
                return "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop&auto=format"; // BMW i3 Electric
            } else if (modelLower.contains("520") || modelLower.contains("5er")) {
                return "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&auto=format"; // BMW 5er
            } else if (modelLower.equals("i4")) {
                return "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop&auto=format"; // BMW i4 Electric
            } else if (modelLower.contains("x1")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // BMW X1 SUV
            } else if (modelLower.contains("x3")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // BMW X3 SUV
            } else if (modelLower.contains("x5") || modelLower.contains("x7")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // BMW X5/X7 SUV
            } else if (modelLower.equals("ix")) {
                return "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop&auto=format"; // BMW iX Electric SUV
            } else if (modelLower.contains("z4") || modelLower.contains("m3") || modelLower.contains("m4")) {
                return "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&auto=format"; // BMW Sportwagen
            } else if (modelLower.contains("1er")) {
                return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format"; // BMW 1er
            }
        }
        
        // Mercedes Modelle
        if (brandLower.equals("mercedes")) {
            if (modelLower.contains("c-") || modelLower.contains("c220") || modelLower.contains("cla")) {
                return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&auto=format"; // Mercedes C-Klasse Sedan
            } else if (modelLower.contains("e-") || modelLower.contains("e-klasse")) {
                return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&auto=format"; // Mercedes E-Klasse Sedan
            } else if (modelLower.contains("s-") || modelLower.contains("s-klasse")) {
                return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&auto=format"; // Mercedes S-Klasse Luxury
            } else if (modelLower.contains("glc")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // Mercedes GLC SUV
            } else if (modelLower.contains("gla")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // Mercedes GLA SUV
            } else if (modelLower.contains("eqc")) {
                return "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop&auto=format"; // Mercedes EQC Electric
            } else if (modelLower.contains("a-") || modelLower.contains("a-klasse")) {
                return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&auto=format"; // Mercedes A-Klasse
            } else if (modelLower.contains("b-") || modelLower.contains("b-klasse")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // Mercedes B-Klasse Van
            } else if (modelLower.contains("v-") || modelLower.contains("v-klasse")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // Mercedes V-Klasse Van
            }
        }
        
        // Audi Modelle
        if (brandLower.equals("audi")) {
            if (modelLower.contains("a1")) {
                return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format"; // Audi A1 Compact
            } else if (modelLower.contains("a3")) {
                return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format"; // Audi A3 Compact
            } else if (modelLower.contains("a4")) {
                return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format"; // Audi A4 Sedan
            } else if (modelLower.contains("a5")) {
                return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format"; // Audi A5 Coupe
            } else if (modelLower.contains("a6")) {
                return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format"; // Audi A6 Sedan
            } else if (modelLower.contains("a8")) {
                return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format"; // Audi A8 Luxury
            } else if (modelLower.contains("q3")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // Audi Q3 SUV
            } else if (modelLower.contains("q5")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // Audi Q5 SUV
            } else if (modelLower.contains("q7")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // Audi Q7 SUV
            } else if (modelLower.contains("tt")) {
                return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&auto=format"; // Audi TT Sports
            } else if (modelLower.contains("e-tron")) {
                return "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop&auto=format"; // Audi e-tron Electric
            }
        }
        
        // VW Modelle
        if (brandLower.equals("vw") || brandLower.equals("volkswagen")) {
            if (modelLower.contains("polo")) {
                return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format"; // VW Polo Small
            } else if (modelLower.contains("golf")) {
                return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format"; // VW Golf Compact
            } else if (modelLower.contains("passat")) {
                return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&auto=format"; // VW Passat Mid-size
            } else if (modelLower.contains("arteon")) {
                return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&auto=format"; // VW Arteon Premium
            } else if (modelLower.contains("tiguan")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // VW Tiguan SUV
            } else if (modelLower.contains("t-cross")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // VW T-Cross SUV
            } else if (modelLower.contains("touran")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // VW Touran Van
            } else if (modelLower.contains("id.3")) {
                return "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop&auto=format"; // VW ID.3 Electric
            } else if (modelLower.contains("id.4")) {
                return "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop&auto=format"; // VW ID.4 Electric SUV
            }
        }
        
        // Porsche Modelle
        if (brandLower.equals("porsche")) {
            if (modelLower.contains("911")) {
                return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&auto=format"; // Porsche 911 Sports
            } else if (modelLower.contains("cayenne")) {
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"; // Porsche Cayenne SUV
            } else if (modelLower.contains("boxster") || modelLower.contains("cayman")) {
                return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&auto=format"; // Porsche Boxster/Cayman
            }
        }
        
        // Fallback: Generische Bilder basierend auf Typ
        switch (type) {
            case KLEINWAGEN:
                return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format";
            case KOMPAKTKLASSE:
                return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format";
            case MITTELKLASSE:
                return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&auto=format";
            case OBERKLASSE:
                return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&auto=format";
            case SUV:
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format";
            case VAN:
                return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format";
            case SPORTWAGEN:
                return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&auto=format";
            default:
                return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&auto=format";
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
