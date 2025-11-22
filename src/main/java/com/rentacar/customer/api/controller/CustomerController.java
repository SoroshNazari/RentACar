package com.rentacar.customer.api.controller;

import com.rentacar.customer.api.dto.CustomerDto;
import com.rentacar.customer.domain.model.Customer;
import com.rentacar.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customer", description = "Customer Management API")
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new customer")
    public CustomerDto.Response createCustomer(@Valid @RequestBody CustomerDto.CreateRequest request) {
        Customer customer = Customer.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .driverLicense(request.getDriverLicense())
                .address(request.getAddress())
                .build();

        Customer saved = customerService.createCustomer(customer);
        return mapToResponse(saved);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public CustomerDto.Response getCustomer(@PathVariable UUID id) {
        Customer customer = customerService.getCustomer(id);
        return mapToResponse(customer);
    }

    @GetMapping("/by-email/{email}")
    @Operation(summary = "Get customer by email")
    public CustomerDto.Response getCustomerByEmail(@PathVariable String email) {
        Customer customer = customerService.getCustomerByEmail(email);
        return mapToResponse(customer);
    }

    @GetMapping("/by-number/{customerNumber}")
    @Operation(summary = "Get customer by customer number")
    public CustomerDto.Response getCustomerByNumber(@PathVariable String customerNumber) {
        Customer customer = customerService.getCustomerByCustomerNumber(customerNumber);
        return mapToResponse(customer);
    }

    private CustomerDto.Response mapToResponse(Customer customer) {
        CustomerDto.Response response = new CustomerDto.Response();
        response.setId(customer.getId());
        response.setCustomerNumber(customer.getCustomerNumber());
        response.setFirstName(customer.getFirstName());
        response.setLastName(customer.getLastName());
        response.setEmail(customer.getEmail());
        return response;
    }
}
