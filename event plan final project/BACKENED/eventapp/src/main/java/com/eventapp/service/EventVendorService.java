package com.eventapp.service;

import com.eventapp.entity.EventVendor;
import com.eventapp.repository.EventVendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EventVendorService {
    private final EventVendorRepository eventVendorRepository;

    public List<EventVendor> getAll() { return eventVendorRepository.findAll(); }

    public Optional<EventVendor> getById(Integer id) { return eventVendorRepository.findById(id); }

    public EventVendor create(EventVendor ev) { return eventVendorRepository.save(ev); }

    public EventVendor update(Integer id, EventVendor updated) {
        return eventVendorRepository.findById(id).map(ev -> {
            ev.setEvent(updated.getEvent());
            ev.setVendor(updated.getVendor());
            ev.setAgreedPrice(updated.getAgreedPrice());
            ev.setContractStatus(updated.getContractStatus());
            ev.setPaymentStatus(updated.getPaymentStatus());
            return eventVendorRepository.save(ev);
        }).orElseThrow(() -> new RuntimeException("EventVendor not found: " + id));
    }

    public void delete(Integer id) { eventVendorRepository.deleteById(id); }

    public List<EventVendor> getByEvent(Integer eventId) { return eventVendorRepository.findByEvent_EventId(eventId); }

    public List<EventVendor> getByVendor(Integer vendorId) { return eventVendorRepository.findByVendor_VendorId(vendorId); }
}
