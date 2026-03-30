package com.eventapp.controller;

import com.eventapp.entity.Vendor;
import com.eventapp.security.JwtUtil;
import com.eventapp.service.AuthService;
import com.eventapp.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VendorController {
    private final VendorService vendorService;
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public List<Vendor> getAll() { return vendorService.getAllVendors(); }

    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getById(@PathVariable Integer id) {
        return vendorService.getVendorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody VendorRegisterRequest request) {
        try {
            AuthService.VendorRegistrationResult result = authService.registerVendor(
                    request.getName(),
                    request.getEmail(),
                    request.getPhone(),
                    request.getPassword(),
                    request.getBusinessName(),
                    request.getServiceType(),
                    request.getStartingPrice()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new VendorRegisterResponse(
                            "Vendor account created successfully.",
                            result.user().getEmail(),
                            result.user().getIsVerified()
                    ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new MessageResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody VendorLoginRequest request) {
        try {
            Vendor vendor = authService.authenticateVendor(request.getEmail(), request.getPassword());
            String token = jwtUtil.generateToken(vendor.getUser().getEmail(), vendor.getUser().getRole(), vendor.getVendorId());
            return ResponseEntity.ok(new VendorAuthResponse(
                    token,
                    vendor.getUser().getEmail(),
                    vendor.getUser().getRole(),
                    vendor.getUser().getIsVerified(),
                    vendor.getUser().getUserId(),
                    vendor
            ));
        } catch (RuntimeException e) {
            String message = e.getMessage() == null ? "Invalid credentials" : e.getMessage();
            if (message.toLowerCase().contains("verify")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse(message));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse(message));
        }
    }

    @PostMapping
    public Vendor create(@RequestBody Vendor vendor) { return vendorService.createVendor(vendor); }

    @PutMapping("/{id}")
    public ResponseEntity<Vendor> update(@PathVariable Integer id, @RequestBody Vendor vendor) {
        try { return ResponseEntity.ok(vendorService.updateVendor(id, vendor)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/service/{serviceType}")
    public List<Vendor> getByServiceType(@PathVariable String serviceType) { return vendorService.getVendorsByServiceType(serviceType); }

    @GetMapping("/user/{userId}")
    public List<Vendor> getByUser(@PathVariable Integer userId) { return vendorService.getVendorsByUser(userId); }

    public static class VendorRegisterRequest {
        private String name;
        private String email;
        private String phone;
        private String password;
        private String businessName;
        private String serviceType;
        private BigDecimal startingPrice;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getBusinessName() { return businessName; }
        public void setBusinessName(String businessName) { this.businessName = businessName; }
        public String getServiceType() { return serviceType; }
        public void setServiceType(String serviceType) { this.serviceType = serviceType; }
        public BigDecimal getStartingPrice() { return startingPrice; }
        public void setStartingPrice(BigDecimal startingPrice) { this.startingPrice = startingPrice; }
    }

    public static class VendorLoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class VendorRegisterResponse {
        private String message;
        private String email;
        private Boolean isVerified;

        public VendorRegisterResponse(String message, String email, Boolean isVerified) {
            this.message = message;
            this.email = email;
            this.isVerified = isVerified;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Boolean getIsVerified() { return isVerified; }
        public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    }

    public static class VendorAuthResponse {
        private String token;
        private String email;
        private String role;
        private Boolean isVerified;
        private Integer userId;
        private Vendor vendor;

        public VendorAuthResponse(String token, String email, String role, Boolean isVerified, Integer userId, Vendor vendor) {
            this.token = token;
            this.email = email;
            this.role = role;
            this.isVerified = isVerified;
            this.userId = userId;
            this.vendor = vendor;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public Boolean getIsVerified() { return isVerified; }
        public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }
        public Vendor getVendor() { return vendor; }
        public void setVendor(Vendor vendor) { this.vendor = vendor; }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
