package com.rentacar.infrastructure.email;

import com.rentacar.booking.domain.event.BookingCreatedEvent;
import com.rentacar.booking.domain.event.BookingCancelledEvent;
import com.rentacar.customer.domain.model.Customer;
import com.rentacar.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Event Listener for Booking Events to trigger email notifications.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BookingEmailListener {

    private final EmailService emailService;
    private final CustomerRepository customerRepository;

    @EventListener
    public void handleBookingCreated(BookingCreatedEvent event) {
        log.info("Handling BookingCreatedEvent for booking: {}", event.getBookingId());

        customerRepository.findById(event.getCustomerId()).ifPresent(customer -> {
            emailService.sendBookingConfirmation(
                    customer.getEmail(),
                    customer.getFirstName() + " " + customer.getLastName(),
                    event.getBookingId().toString());
        });
    }

    @EventListener
    public void handleBookingCancelled(BookingCancelledEvent event) {
        log.info("Handling BookingCancelledEvent for booking: {}", event.getBookingId());

        customerRepository.findById(event.getCustomerId()).ifPresent(customer -> {
            emailService.sendBookingCancellation(
                    customer.getEmail(),
                    customer.getFirstName() + " " + customer.getLastName(),
                    event.getBookingId().toString());
        });
    }
}
