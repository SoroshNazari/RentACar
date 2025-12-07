package de.rentacar.user.service;

import de.rentacar.user.domain.model.User;

public interface UserService {
    User registerNewUser(User user);
    void activateUser(String token);
}
