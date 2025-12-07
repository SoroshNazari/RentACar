package de.rentacar.shared.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PasswordConstraintValidator.class)
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPassword {
    String message() default "Passwort muss mindestens 8 Zeichen lang sein und Großbuchstaben, Kleinbuchstaben sowie Zahlen enthalten";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}


