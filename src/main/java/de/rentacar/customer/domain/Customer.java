package de.rentacar.customer.domain;

import de.rentacar.user.domain.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
// WICHTIG: Wir erben von User, nicht von BaseEntity!
// Damit nutzen wir die ID, Username & Password vom User.
@PrimaryKeyJoinColumn(name = "id")
public class Customer extends User {

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    // ACHTUNG: 'email' existiert schon im User für den Login.
    // Falls du eine separate Kontakt-Email brauchst, nennen wir sie hier anders
    // oder nutzen einfach die vom User. Ich habe sie hier erstmal auskommentiert,
    // um Konflikte zu vermeiden. Nutze user.getEmail()!
    /*
    @Embedded
    @AttributeOverride(name = "encryptedValue", column = @Column(name = "encrypted_email"))
    private EncryptedString contactEmail;
    */

    @Embedded
    @AttributeOverride(name = "encryptedValue", column = @Column(name = "encrypted_phone"))
    private EncryptedString phone;

    @Embedded
    @AttributeOverride(name = "encryptedValue", column = @Column(name = "encrypted_address"))
    private EncryptedString address;

    @Embedded
    @AttributeOverride(name = "encryptedValue", column = @Column(name = "encrypted_license_number"))
    private EncryptedString driverLicenseNumber;

    // username & password ENTFERNT - sind bereits in der Elternklasse User!

    /**
     * Sichere toString Methode (verhindert StackOverflow)
     */
    @Override
    public String toString() {
        return "Customer{" +
                "id=" + getId() +
                ", username='" + getUsername() + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                '}';
    }

    // Die Domain-Methoden müssen angepasst werden, da wir jetzt Setter nutzen
    public void updatePersonalData(String firstName, String lastName, EncryptedString phone, EncryptedString address) {
        if (firstName != null && !firstName.trim().isEmpty()) this.firstName = firstName;
        if (lastName != null && !lastName.trim().isEmpty()) this.lastName = lastName;
        if (phone != null) this.phone = phone;
        if (address != null) this.address = address;
    }

    public void updateDriverLicense(EncryptedString driverLicenseNumber) {
        if (driverLicenseNumber == null) throw new IllegalArgumentException("Führerscheinnummer darf nicht null sein");
        this.driverLicenseNumber = driverLicenseNumber;
    }
}