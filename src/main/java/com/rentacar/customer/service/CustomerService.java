package com.rentacar.customer.service;

import com.rentacar.customer.domain.model.Customer;
import com.rentacar.customer.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional
    public Customer createCustomer(Customer customer) {
        // Generate customer number (simple implementation)
        String customerNumber = "CUS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        customer.setCustomerNumber(customerNumber);
        return customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public Customer getCustomer(@NonNull UUID id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Customer getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public Customer getCustomerByCustomerNumber(String customerNumber) {
        return customerRepository.findByCustomerNumber(customerNumber)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with number: " + customerNumber));
    }
}
