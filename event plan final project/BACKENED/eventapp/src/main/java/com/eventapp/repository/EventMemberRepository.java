package com.eventapp.repository;
import com.eventapp.entity.EventMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface EventMemberRepository extends JpaRepository<EventMember, Integer> {
    List<EventMember> findByEvent_EventId(Integer eventId);
    List<EventMember> findByUser_UserId(Integer userId);
    List<EventMember> findByStatus(String status);
    Optional<EventMember> findByEvent_EventIdAndUser_UserId(Integer eventId, Integer userId);
}
