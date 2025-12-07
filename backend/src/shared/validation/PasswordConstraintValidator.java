package de.rentacar.shared.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PasswordConstraintValidator implements ConstraintValidator<ValidPassword, String> {

    private static final String PASSWORD_PATTERN = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$";
    private final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);

    @Override
    public void initialize(ValidPassword constraintAnnotation) {
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Passwort darf nicht leer sein")
                    .addConstraintViolation();
            return false;
        }
        Matcher matcher = pattern.matcher(password);
        if (!matcher.matches()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    "Passwort muss mindestens 8 Zeichen lang sein und Großbuchstaben, Kleinbuchstaben sowie Zahlen enthalten")
                    .addConstraintViolation();
            return false;
        }
        return true;
    }
}


