package com.rentacar.customer.domain.model;

import com.rentacar.customer.infrastructure.security.AttributeEncryptor;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "customer")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
/**
 * Domain-Klasse für Customer.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "customer_number", unique = true, nullable = false)
    private String customerNumber;

    private String firstName;

    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Convert(converter = AttributeEncryptor.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String driverLicense;

    @Convert(converter = AttributeEncryptor.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;
}
