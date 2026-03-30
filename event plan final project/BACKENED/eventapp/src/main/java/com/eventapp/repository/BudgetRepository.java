package com.eventapp.repository;
import com.eventapp.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BudgetRepository extends JpaRepository<Budget, Integer> {
    List<Budget> findByEvent_EventId(Integer eventId);
}
