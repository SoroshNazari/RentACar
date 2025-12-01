package de.rentacar.customer.web;

import de.rentacar.customer.application.CustomerService;
import de.rentacar.customer.domain.Customer;
import lombok.RequiredArgsConstructor;
import de.rentacar.customer.infrastructure.EncryptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

/**
 * REST Controller für Kundenverwaltung
 */
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final EncryptionService encryptionService;

    @PostMapping("/register")
    public ResponseEntity<Customer> registerCustomer(@RequestBody RegisterCustomerRequest request,
                                                    HttpServletRequest httpRequest) {
        Customer customer = customerService.registerCustomer(
                request.username(),
                request.password(),
                request.firstName(),
                request.lastName(),
                request.email(),
                request.phone(),
                request.address(),
                request.driverLicenseNumber(),
                httpRequest.getRemoteAddr()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(customer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id,
                                                   @RequestBody UpdateCustomerRequest request,
                                                   Authentication authentication,
                                                   HttpServletRequest httpRequest) {
        Customer customer = customerService.updateCustomerData(
                id,
                request.firstName(),
                request.lastName(),
                request.email(),
                request.phone(),
                request.address(),
                authentication.getName(),
                httpRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(customer);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<Customer> getCustomerByUsername(@PathVariable String username) {
        return ResponseEntity.ok(customerService.getCustomerByUsername(username));
    }

    @GetMapping("/me")
    public ResponseEntity<CustomerDetailsResponse> getOwnDetails(Authentication authentication) {
        try {
            String username = authentication.getName();
            Customer customer = customerService.getCustomerByUsername(username);
            String email = customer.getEmail() != null ? encryptionService.decrypt(customer.getEmail().getEncryptedValue()) : null;
            String phone = customer.getPhone() != null ? encryptionService.decrypt(customer.getPhone().getEncryptedValue()) : null;
            String address = customer.getAddress() != null ? encryptionService.decrypt(customer.getAddress().getEncryptedValue()) : null;
            String license = customer.getDriverLicenseNumber() != null ? encryptionService.decrypt(customer.getDriverLicenseNumber().getEncryptedValue()) : null;

            CustomerDetailsResponse dto = new CustomerDetailsResponse(
                    customer.getId(),
                    customer.getFirstName(),
                    customer.getLastName(),
                    email,
                    phone,
                    address,
                    license,
                    customer.getUsername()
            );
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    public record RegisterCustomerRequest(
            String username,
            String password,
            String firstName,
            String lastName,
            String email,
            String phone,
            String address,
            String driverLicenseNumber
    ) {}

    public record UpdateCustomerRequest(
            String firstName,
            String lastName,
            String email,
            String phone,
            String address
    ) {}

    public record CustomerDetailsResponse(
            Long id,
            String firstName,
            String lastName,
            String email,
            String phone,
            String address,
            String driverLicenseNumber,
            String username
    ) {}
}
