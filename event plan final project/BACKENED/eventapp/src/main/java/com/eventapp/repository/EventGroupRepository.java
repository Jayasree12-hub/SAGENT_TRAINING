package com.eventapp.repository;
import com.eventapp.entity.EventGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface EventGroupRepository extends JpaRepository<EventGroup, Integer> {
    List<EventGroup> findByEvent_EventId(Integer eventId);
    Optional<EventGroup> findFirstByEvent_EventId(Integer eventId);
    Optional<EventGroup> findByJoinCode(String joinCode);
}
