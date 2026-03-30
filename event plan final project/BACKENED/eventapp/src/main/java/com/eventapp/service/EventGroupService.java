package com.eventapp.service;

import com.eventapp.entity.EventGroup;
import com.eventapp.repository.EventGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EventGroupService {
    private final EventGroupRepository eventGroupRepository;

    public List<EventGroup> getAll() { return eventGroupRepository.findAll(); }

    public Optional<EventGroup> getById(Integer id) { return eventGroupRepository.findById(id); }

    public EventGroup create(EventGroup eg) { return eventGroupRepository.save(eg); }

    public EventGroup update(Integer id, EventGroup updated) {
        return eventGroupRepository.findById(id).map(eg -> {
            eg.setEvent(updated.getEvent());
            eg.setCreatedBy(updated.getCreatedBy());
            eg.setJoinCode(updated.getJoinCode());
            return eventGroupRepository.save(eg);
        }).orElseThrow(() -> new RuntimeException("EventGroup not found: " + id));
    }

    public void delete(Integer id) { eventGroupRepository.deleteById(id); }

    public List<EventGroup> getByEvent(Integer eventId) { return eventGroupRepository.findByEvent_EventId(eventId); }

    public Optional<EventGroup> getByJoinCode(String joinCode) { return eventGroupRepository.findByJoinCode(joinCode); }
}
