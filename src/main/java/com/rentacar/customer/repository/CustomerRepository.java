package com.rentacar.customer.repository;

import com.rentacar.customer.domain.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByCustomerNumber(String customerNumber);

    Optional<Customer> findByEmail(String email);
}
