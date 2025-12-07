package de.rentacar.user.domain.model;

import de.rentacar.user.validation.ValidPassword;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
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
}
