package com.eventapp.service;

import com.eventapp.entity.User;
import com.eventapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<User> getAllUsers() { return userRepository.findAll(); }

    public Optional<User> getUserById(Integer id) { return userRepository.findById(id); }

    public User createUser(User user) {
        user.setRole(normalizeRole(user.getRole()));
        return userRepository.save(user);
    }

    public User updateUser(Integer id, User updated) {
        return userRepository.findById(id).map(u -> {
            u.setName(updated.getName());
            u.setEmail(updated.getEmail());
            u.setPhone(updated.getPhone());
            u.setPassword(updated.getPassword());
            u.setRole(normalizeRole(updated.getRole()));
            u.setSpecialization(updated.getSpecialization());
            return userRepository.save(u);
        }).orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public void deleteUser(Integer id) { userRepository.deleteById(id); }

    public List<User> getUsersByRole(String role) {
        String normalizedRole = normalizeRole(role);
        return userRepository.findAll().stream()
                .filter(user -> normalizeRole(user.getRole()).equals(normalizedRole))
                .toList();
    }

    public Optional<User> getByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email);
    }

    private String normalizeRole(String role) {
        if (role == null) {
            return null;
        }
        return role.trim()
                .replace('-', '_')
                .replace(' ', '_')
                .toUpperCase();
    }
}
