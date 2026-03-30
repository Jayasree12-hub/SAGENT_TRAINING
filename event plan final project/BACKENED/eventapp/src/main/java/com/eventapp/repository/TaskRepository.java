package com.eventapp.repository;
import com.eventapp.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByEvent_EventId(Integer eventId);
    List<Task> findByAssignedTo_UserId(Integer userId);
    List<Task> findByStatus(String status);
    long countByAssignedTo_UserId(Integer userId);
    long countByAssignedTo_UserIdAndStatus(Integer userId, String status);
    boolean existsByEvent_EventIdAndAssignedTo_UserId(Integer eventId, Integer userId);
}
