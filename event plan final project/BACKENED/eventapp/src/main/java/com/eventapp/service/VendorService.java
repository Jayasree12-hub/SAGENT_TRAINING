package com.eventapp.service;

import com.eventapp.entity.Vendor;
import com.eventapp.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VendorService {
    private final VendorRepository vendorRepository;

    public List<Vendor> getAllVendors() { return vendorRepository.findAll(); }

    public Optional<Vendor> getVendorById(Integer id) { return vendorRepository.findById(id); }

    public Vendor createVendor(Vendor vendor) { return vendorRepository.save(vendor); }

    public Vendor updateVendor(Integer id, Vendor updated) {
        return vendorRepository.findById(id).map(v -> {
            if (updated.getUser() != null) {
                v.setUser(updated.getUser());
            }
            v.setBusinessName(updated.getBusinessName());
            v.setServiceType(updated.getServiceType());
            v.setStartingPrice(updated.getStartingPrice());
            if (updated.getRating() != null) {
                v.setRating(updated.getRating());
            }
            v.setAboutBusiness(updated.getAboutBusiness());
            v.setBusinessDetails(updated.getBusinessDetails());
            v.setPhotoUrl(updated.getPhotoUrl());
            return vendorRepository.save(v);
        }).orElseThrow(() -> new RuntimeException("Vendor not found: " + id));
    }

    public void deleteVendor(Integer id) { vendorRepository.deleteById(id); }

    public List<Vendor> getVendorsByServiceType(String serviceType) { return vendorRepository.findByServiceType(serviceType); }

    public List<Vendor> getVendorsByUser(Integer userId) { return vendorRepository.findByUser_UserId(userId); }
}
