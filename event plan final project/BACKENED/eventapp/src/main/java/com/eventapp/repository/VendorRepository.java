package com.eventapp.repository;
import com.eventapp.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface VendorRepository extends JpaRepository<Vendor, Integer> {
    List<Vendor> findByServiceType(String serviceType);
    List<Vendor> findByUser_UserId(Integer userId);
    Optional<Vendor> findFirstByUser_UserId(Integer userId);
}
