package com.eventapp.controller;

import com.eventapp.entity.Budget;
import com.eventapp.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BudgetController {
    private final BudgetService budgetService;

    @GetMapping
    public List<Budget> getAll() { return budgetService.getAllBudgets(); }

    @GetMapping("/{id}")
    public ResponseEntity<Budget> getById(@PathVariable Integer id) {
        return budgetService.getBudgetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Budget create(@RequestBody Budget budget) { return budgetService.createBudget(budget); }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> update(@PathVariable Integer id, @RequestBody Budget budget) {
        try { return ResponseEntity.ok(budgetService.updateBudget(id, budget)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/event/{eventId}")
    public List<Budget> getByEvent(@PathVariable Integer eventId) { return budgetService.getBudgetsByEvent(eventId); }
}
