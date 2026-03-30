package com.eventapp.repository;
import com.eventapp.entity.EventVendor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface EventVendorRepository extends JpaRepository<EventVendor, Integer> {
    List<EventVendor> findByEvent_EventId(Integer eventId);
    List<EventVendor> findByVendor_VendorId(Integer vendorId);
}
