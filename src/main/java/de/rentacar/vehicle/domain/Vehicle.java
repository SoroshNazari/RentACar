package de.rentacar.vehicle.domain;

import de.rentacar.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle extends BaseEntity {

    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "license_plate"))
    private LicensePlate licensePlate;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 50)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType type;

    @Column(name = "model_year")
    private Integer year;

    @Column(nullable = false)
    private Long mileage;

    @Column(nullable = false, length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.VERFÜGBAR;

    @Column(nullable = false)
    private Double dailyPrice;

    // ÄNDERUNG: Einzelnes Feld 'imageUrl' entfernt, um Redundanz zu vermeiden.
    // Stattdessen nutzen wir nur die Gallery.

    // ÄNDERUNG: FetchType.LAZY für Performance
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "vehicle_images", joinColumns = @JoinColumn(name = "vehicle_id"))
    @Column(name = "image_url", length = 500)
    @Builder.Default
    private List<String> imageGallery = new ArrayList<>();

    /**
     * Helper: Gibt das erste Bild als Vorschaubild zurück
     */
    public String getMainImageUrl() {
        if (imageGallery != null && !imageGallery.isEmpty()) {
            return imageGallery.get(0);
        }
        return null; // Oder einen Platzhalter-URL zurückgeben
    }

    // --- Domain Methoden ---

    public void markAsRented() {
        if (this.status != VehicleStatus.VERFÜGBAR) {
            throw new IllegalStateException("Fahrzeug " + licensePlate + " ist nicht verfügbar (Status: " + status + ")");
        }
        this.status = VehicleStatus.VERMIETET;
    }

    public void markAsAvailable() {
        this.status = VehicleStatus.VERFÜGBAR;
    }

    public void updateMileage(Long newMileage) {
        if (newMileage == null) return; // Keine Änderung
        if (newMileage < this.mileage) {
            throw new IllegalArgumentException("Neuer Kilometerstand darf nicht kleiner sein als der alte.");
        }
        this.mileage = newMileage;
    }

    // ... Wartungsmethoden bleiben wie gehabt
}