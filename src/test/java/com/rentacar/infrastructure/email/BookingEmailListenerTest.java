package com.rentacar.infrastructure.email;

import com.rentacar.booking.domain.event.BookingCancelledEvent;
import com.rentacar.booking.domain.event.BookingCreatedEvent;
import com.rentacar.customer.domain.model.Customer;
import com.rentacar.customer.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingEmailListenerTest {

    @Mock
    private EmailService emailService;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private BookingEmailListener bookingEmailListener;

    @Test
    void handleBookingCreated_shouldSendConfirmationEmail() {
        // Given
        UUID bookingId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();

        Customer customer = new Customer();
        customer.setId(customerId);
        customer.setEmail("customer@example.com");
        customer.setFirstName("Max");
        customer.setLastName("Mustermann");

        BookingCreatedEvent event = new BookingCreatedEvent(bookingId, customerId);

        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));

        // When
        bookingEmailListener.handleBookingCreated(event);

        // Then
        verify(emailService).sendBookingConfirmation(
                "customer@example.com",
                "Max Mustermann",
                bookingId.toString());
    }

    @Test
    void handleBookingCreated_whenCustomerNotFound_shouldNotSendEmail() {
        // Given
        UUID bookingId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();

        BookingCreatedEvent event = new BookingCreatedEvent(bookingId, customerId);

        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        // When
        bookingEmailListener.handleBookingCreated(event);

        // Then
        verify(emailService, never()).sendBookingConfirmation(anyString(), anyString(), anyString());
    }

    @Test
    void handleBookingCancelled_shouldSendCancellationEmail() {
        // Given
        UUID bookingId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();

        Customer customer = new Customer();
        customer.setId(customerId);
        customer.setEmail("customer@example.com");
        customer.setFirstName("Anna");
        customer.setLastName("Schmidt");

        BookingCancelledEvent event = new BookingCancelledEvent(bookingId, customerId);

        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));

        // When
        bookingEmailListener.handleBookingCancelled(event);

        // Then
        verify(emailService).sendBookingCancellation(
                "customer@example.com",
                "Anna Schmidt",
                bookingId.toString());
    }

    @Test
    void handleBookingCancelled_whenCustomerNotFound_shouldNotSendEmail() {
        // Given
        UUID bookingId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();

        BookingCancelledEvent event = new BookingCancelledEvent(bookingId, customerId);

        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        // When
        bookingEmailListener.handleBookingCancelled(event);

        // Then
        verify(emailService, never()).sendBookingCancellation(anyString(), anyString(), anyString());
    }
}
