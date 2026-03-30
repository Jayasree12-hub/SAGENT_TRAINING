package com.eventapp.service;

import com.eventapp.entity.User;
import com.eventapp.entity.Vendor;
import com.eventapp.repository.UserRepository;
import com.eventapp.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserService userService;

    private final EmailService emailService;

    private final VendorRepository vendorRepository;

    public User authenticate(String email, String rawPassword) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new RuntimeException("Invalid credentials");
        }
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        String storedPassword = user.getPassword();
        if (storedPassword == null) {
            throw new RuntimeException("Invalid credentials");
        }

        if (storedPassword.startsWith("$2")) {
            if (!passwordEncoder.matches(rawPassword, storedPassword)) {
                throw new RuntimeException("Invalid credentials");
            }
        } else {
            if (!storedPassword.equals(rawPassword)) {
                throw new RuntimeException("Invalid credentials");
            }
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
        }

        Boolean verified = user.getIsVerified();
        if (verified != null && !verified) {
            throw new RuntimeException("Please verify your email before logging in.");
        }
        if (verified == null) {
            user.setIsVerified(true);
            userRepository.save(user);
        }

        return user;
    }

    public User register(String name,
                         String email,
                         String phone,
                         String password,
                         String role,
                         String specialization) {

        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        User existing = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (existing != null) {
            if (Boolean.FALSE.equals(existing.getIsVerified())) {
                resendOtp(normalizedEmail);
                return existing;
            }
            throw new IllegalArgumentException("Account already exists");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(normalizedEmail);
        user.setPhone(phone);
        user.setPassword(password);
        user.setRole(role);
        user.setSpecialization(specialization);
        user.setIsVerified(false);
        user.setOtpCode(generateOtp());
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));

        User created = userService.createUser(user);
        emailService.sendOtpEmail(created.getEmail(), created.getOtpCode());
        return created;
    }

    @Transactional
    public VendorRegistrationResult registerVendor(String name,
                                                   String email,
                                                   String phone,
                                                   String password,
                                                   String businessName,
                                                   String serviceType,
                                                   BigDecimal startingPrice) {

        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (businessName == null || businessName.isBlank()) {
            throw new IllegalArgumentException("Business name is required");
        }
        if (serviceType == null || serviceType.isBlank()) {
            throw new IllegalArgumentException("Service type is required");
        }
        if (startingPrice == null || startingPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Starting price must be zero or more");
        }

        User existing = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (existing != null) {
            if (!"VENDOR".equalsIgnoreCase(existing.getRole())) {
                throw new IllegalArgumentException("This email is already used for another account. Please use a different email for vendor signup.");
            }
            Vendor vendor = upsertVendorProfile(existing, businessName, serviceType, startingPrice);
            if (Boolean.FALSE.equals(existing.getIsVerified())) {
                existing.setIsVerified(true);
                existing.setOtpCode(null);
                existing.setOtpExpiresAt(null);
                userRepository.save(existing);
                return new VendorRegistrationResult(existing, vendor);
            }
            throw new IllegalArgumentException("Vendor account already exists");
        }

        User vendorUser = new User();
        vendorUser.setName(name);
        vendorUser.setEmail(normalizedEmail);
        vendorUser.setPhone(phone);
        vendorUser.setPassword(password);
        vendorUser.setRole("VENDOR");
        vendorUser.setSpecialization(serviceType);
        vendorUser.setIsVerified(true);
        vendorUser.setOtpCode(null);
        vendorUser.setOtpExpiresAt(null);

        User createdUser = userService.createUser(vendorUser);
        Vendor vendor = upsertVendorProfile(createdUser, businessName, serviceType, startingPrice);
        return new VendorRegistrationResult(createdUser, vendor);
    }

    public Vendor authenticateVendor(String email, String rawPassword) {
        User user = authenticate(email, rawPassword);
        if (!"VENDOR".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("This email is not registered as a vendor. Please sign in through the organizer login.");
        }

        return vendorRepository.findFirstByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Vendor profile not found"));
    }

    public void verifyOtp(String email, String otp) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtpCode() == null || user.getOtpExpiresAt() == null) {
            throw new RuntimeException("OTP expired");
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiresAt())) {
            throw new RuntimeException("OTP expired");
        }

        if (otp == null || !otp.trim().equals(user.getOtpCode())) {
            throw new RuntimeException("Invalid OTP");
        }

        user.setIsVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);
    }

    public void resendOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getIsVerified())) {
            return;
        }

        user.setOtpCode(generateOtp());
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);
        emailService.sendOtpEmail(user.getEmail(), user.getOtpCode());
    }

    private String generateOtp() {
        int otp = ThreadLocalRandom.current().nextInt(100000, 1000000);
        return String.valueOf(otp);
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    private Vendor upsertVendorProfile(User user,
                                       String businessName,
                                       String serviceType,
                                       BigDecimal startingPrice) {
        Vendor vendor = vendorRepository.findFirstByUser_UserId(user.getUserId())
                .orElseGet(Vendor::new);
        vendor.setUser(user);
        vendor.setBusinessName(businessName.trim());
        vendor.setServiceType(serviceType.trim());
        vendor.setStartingPrice(startingPrice);
        return vendorRepository.save(vendor);
    }

    public record VendorRegistrationResult(User user, Vendor vendor) {}
}
