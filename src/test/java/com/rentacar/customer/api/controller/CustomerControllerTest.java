package com.rentacar.customer.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentacar.customer.api.dto.CustomerDto;
import com.rentacar.customer.domain.model.Customer;
import com.rentacar.customer.service.CustomerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CustomerController.class)
@AutoConfigureMockMvc(addFilters = false)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CustomerService customerService;

    @Test
    void createCustomer_Public_Success() throws Exception {
        // Arrange
        CustomerDto.CreateRequest request = new CustomerDto.CreateRequest();
        request.setFirstName("Max");
        request.setLastName("Mustermann");
        request.setEmail("max@example.com");
        request.setDriverLicense("DL123456");
        request.setAddress("Test Street 1");

        Customer customer = Customer.builder()
                .id(UUID.randomUUID())
                .customerNumber("CUS-12345678")
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .build();

        when(customerService.createCustomer(any(Customer.class))).thenReturn(customer);

        // Act & Assert
        mockMvc.perform(post("/api/v1/customers")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerNumber").value("CUS-12345678"))
                .andExpect(jsonPath("$.firstName").value("Max"))
                .andExpect(jsonPath("$.email").value("max@example.com"));

        verify(customerService).createCustomer(any(Customer.class));
    }

    @Test
    @WithMockUser
    void getCustomer_Authenticated_Success() throws Exception {
        // Arrange
        UUID customerId = UUID.randomUUID();
        Customer customer = Customer.builder()
                .id(customerId)
                .customerNumber("CUS-12345678")
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .build();

        when(customerService.getCustomer(customerId)).thenReturn(customer);

        // Act & Assert
        mockMvc.perform(get("/api/v1/customers/" + customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(customerId.toString()))
                .andExpect(jsonPath("$.customerNumber").value("CUS-12345678"));
    }

    @Test
    @WithMockUser
    void getCustomerByEmail_Success() throws Exception {
        // Arrange
        Customer customer = Customer.builder()
                .id(UUID.randomUUID())
                .customerNumber("CUS-12345678")
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .build();

        when(customerService.getCustomerByEmail("max@example.com")).thenReturn(customer);

        // Act & Assert
        mockMvc.perform(get("/api/v1/customers/by-email/max@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("max@example.com"));
    }

    @Test
    @WithMockUser
    void getCustomerByNumber_Success() throws Exception {
        // Arrange
        Customer customer = Customer.builder()
                .id(UUID.randomUUID())
                .customerNumber("CUS-12345678")
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .build();

        when(customerService.getCustomerByCustomerNumber("CUS-12345678")).thenReturn(customer);

        // Act & Assert
        mockMvc.perform(get("/api/v1/customers/by-number/CUS-12345678"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerNumber").value("CUS-12345678"));
    }
}
