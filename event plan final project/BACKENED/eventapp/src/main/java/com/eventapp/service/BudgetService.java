package com.eventapp.service;

import com.eventapp.entity.Budget;
import com.eventapp.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BudgetService {
    private final BudgetRepository budgetRepository;

    public List<Budget> getAllBudgets() { return budgetRepository.findAll(); }

    public Optional<Budget> getBudgetById(Integer id) { return budgetRepository.findById(id); }

    public Budget createBudget(Budget budget) { return budgetRepository.save(budget); }

    public Budget updateBudget(Integer id, Budget updated) {
        return budgetRepository.findById(id).map(b -> {
            b.setEvent(updated.getEvent());
            b.setCategory(updated.getCategory());
            b.setEstimatedAmount(updated.getEstimatedAmount());
            b.setActualAmount(updated.getActualAmount());
            b.setNotes(updated.getNotes());
            return budgetRepository.save(b);
        }).orElseThrow(() -> new RuntimeException("Budget not found: " + id));
    }

    public void deleteBudget(Integer id) { budgetRepository.deleteById(id); }

    public List<Budget> getBudgetsByEvent(Integer eventId) { return budgetRepository.findByEvent_EventId(eventId); }
}
