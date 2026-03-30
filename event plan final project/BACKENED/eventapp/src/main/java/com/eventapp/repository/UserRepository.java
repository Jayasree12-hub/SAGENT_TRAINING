package com.eventapp.repository;
import com.eventapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    List<User> findByRole(String role);
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
}
