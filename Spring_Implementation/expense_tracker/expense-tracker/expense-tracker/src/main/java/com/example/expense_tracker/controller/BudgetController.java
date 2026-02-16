package com.example.expense_tracker.controller;
//
//public class BudgetController {
//}


import com.example.expense_tracker.entity.Budget;
import com.example.expense_tracker.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService service;

    // Create budget for a user
    @PostMapping("/user/{userId}")
    public Budget createBudget(@PathVariable Long userId, @RequestBody Budget budget){
        return service.createBudget(userId, budget);
    }

    @GetMapping
    public List<Budget> getBudgets(){
        return service.getBudgets();
    }

    @DeleteMapping("/user/{userId}/budget/{budgetId}")
    public String deleteBudget(@PathVariable Long userId, @PathVariable Long budgetId){
        service.deleteBudgetForUser(userId, budgetId);
        return "Budget deleted successfully";
    }

    @PutMapping("/{budgetId}")
    public Budget updateBudget(@PathVariable Long budgetId, @RequestBody Budget budget){
        return service.updateBudget(budgetId, budget);
    }

}
