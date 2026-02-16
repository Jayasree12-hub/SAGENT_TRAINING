package com.example.expense_tracker.service;
//
////public class BudgetService {
////}
//
//import com.example.expense_tracker.entity.Budget;
//import com.example.expense_tracker.repository.BudgetRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class BudgetService {
//
//    private final BudgetRepository repository;
//    private final UserRepository userRepository;
//
//    public Budget createBudget(Budget budget){
//        return repository.save(budget);
//    }
//
//    public List<Budget> getBudgets(){
//        return repository.findAll();
//    }
//}


import com.example.expense_tracker.entity.Budget;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.BudgetRepository;
import com.example.expense_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository; // Inject user repo

    // Create a budget for a specific user
    public Budget createBudget(Long userId, Budget budget) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        budget.setUser(user); // ⚠️ Link the budget to the user
        return budgetRepository.save(budget);
    }

    public List<Budget> getBudgets() {
        return budgetRepository.findAll();
    }

    public void deleteBudget(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + budgetId));
        budgetRepository.delete(budget);
    }

    public void deleteBudgetForUser(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + budgetId));

        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Budget does not belong to this user");
        }

        budgetRepository.delete(budget);
    }

    public Budget updateBudget(Long budgetId, Budget updatedBudget) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        budget.setCategory(updatedBudget.getCategory());
        budget.setAmount(updatedBudget.getAmount());
        budget.setMonth(updatedBudget.getMonth());

        return budgetRepository.save(budget);
    }

}
