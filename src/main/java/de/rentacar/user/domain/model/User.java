package de.rentacar.user.domain.model;

import de.rentacar.user.validation.ValidPassword;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter // Ersetzt @Data (nur Getter)
@Setter // Ersetzt @Data (nur Setter)
@NoArgsConstructor // Wichtig für Hibernate/JPA
// Wir nutzen @Inheritance, da Customer & Employee wahrscheinlich hiervon erben
@Inheritance(strategy = InheritanceType.JOINED)
public class User {
    @Id
    @GeneratedValue
    private Long id;

    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @ValidPassword
    private String password;

    @Email
    @NotBlank
    private String email;

    private String activationToken;

    private boolean enabled = false;

    // Manuelle toString Methode, die KEINE Beziehungen aufruft
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                '}';
    }

    // Equals & HashCode basierend NUR auf der ID (Best Practice für JPA Entities)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        return id != null && id.equals(((User) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}