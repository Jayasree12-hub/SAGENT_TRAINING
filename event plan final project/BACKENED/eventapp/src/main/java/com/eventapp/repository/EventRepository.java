package com.eventapp.repository;
import com.eventapp.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface EventRepository extends JpaRepository<Event, Integer> {
    List<Event> findByOrganizer_UserId(Integer organizerId);
    List<Event> findByOrganizerIsNull();
    List<Event> findByStatus(String status);
    List<Event> findByEventType(String eventType);
}
