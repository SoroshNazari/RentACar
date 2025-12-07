package de.rentacar.booking.domain;

import de.rentacar.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Aggregate Root für Buchungen (Booking Context).
 * Repräsentiert NUR den Plan/Vertrag, nicht die Durchführung.
 */
@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends BaseEntity {

    @Column(nullable = false)
    private Long customerId;

    // ÄNDERUNG: Nur noch die ID speichern, keine harte Objekt-Referenz mehr (Loose Coupling)
    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Column(nullable = false)
    private LocalDate pickupDate;

    @Column(nullable = false)
    private LocalDate returnDate;

    @Column(nullable = false, length = 100)
    private String pickupLocation;

    @Column(nullable = false, length = 100)
    private String returnLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.ANFRAGE;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    private LocalDateTime cancellationDate;

    // Konfigurationen (bleiben hier, da Vertragsbestandteil)
    @Column
    @Builder.Default
    private Boolean insurance = false;

    @Column
    @Builder.Default
    private Boolean additionalDriver = false;

    @Column
    @Builder.Default
    private Boolean childSeat = false;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal extrasCost = BigDecimal.ZERO;

    public void confirm() {
        if (this.status != BookingStatus.ANFRAGE) {
            throw new IllegalStateException("Nur Anfragen können bestätigt werden");
        }
        this.status = BookingStatus.BESTÄTIGT;
    }

    public void cancel() {
        if (this.status == BookingStatus.STORNIERT || this.status == BookingStatus.ABGESCHLOSSEN) {
            throw new IllegalStateException("Buchung kann nicht mehr storniert werden");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime pickupDateTime = pickupDate.atStartOfDay();

        if (now.isAfter(pickupDateTime.minusHours(24))) {
            throw new IllegalStateException("Stornierung nur bis 24 Stunden vor Abholung möglich");
        }

        this.status = BookingStatus.STORNIERT;
        this.cancellationDate = now;
    }

    // Hilfsmethode: Buchung als "Erledigt" markieren (z.B. nach Rückgabe des Autos)
    public void complete() {
        this.status = BookingStatus.ABGESCHLOSSEN;
    }
}