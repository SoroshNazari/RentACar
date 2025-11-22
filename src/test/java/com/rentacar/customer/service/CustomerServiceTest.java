package com.rentacar.customer.service;

import com.rentacar.customer.domain.model.Customer;
import com.rentacar.customer.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    private Customer customer;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .driverLicense("DL123456")
                .address("123 Main St")
                .build();
    }

    @Test
    void createCustomer_Success() {
        // Arrange
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> {
            Customer c = i.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        // Act
        Customer result = customerService.createCustomer(customer);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getCustomerNumber());
        assertTrue(result.getCustomerNumber().startsWith("CUS-"));
        verify(customerRepository).save(customer);
    }

    @Test
    void getCustomer_Success() {
        // Arrange
        UUID customerId = UUID.randomUUID();
        customer.setId(customerId);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));

        // Act
        Customer result = customerService.getCustomer(customerId);

        // Assert
        assertNotNull(result);
        assertEquals(customerId, result.getId());
        assertEquals("John", result.getFirstName());
    }

    @Test
    void getCustomer_NotFound_ThrowsException() {
        // Arrange
        UUID customerId = UUID.randomUUID();
        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> customerService.getCustomer(customerId));
    }

    @Test
    void getCustomerByEmail_Success() {
        // Arrange
        String email = "john.doe@example.com";
        when(customerRepository.findByEmail(email)).thenReturn(Optional.of(customer));

        // Act
        Customer result = customerService.getCustomerByEmail(email);

        // Assert
        assertNotNull(result);
        assertEquals(email, result.getEmail());
    }

    @Test
    void getCustomerByEmail_NotFound_ThrowsException() {
        // Arrange
        String email = "notfound@example.com";
        when(customerRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> customerService.getCustomerByEmail(email));
    }
}
