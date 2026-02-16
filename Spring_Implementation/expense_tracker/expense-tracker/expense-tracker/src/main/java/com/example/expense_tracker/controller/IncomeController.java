//package com.example.expense_tracker.controller;
//
////public class IncomeController {
////}
//
//
//import com.example.expense_tracker.entity.Income;
//import com.example.expense_tracker.service.IncomeService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.web.bind.annotation.*;
//
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/income")
//@RequiredArgsConstructor
//public class IncomeController {
//
//    private final IncomeService incomeService;
//
//    @PostMapping
//    public Income addIncome(@RequestBody Income income) {
//        return incomeService.addIncome(income);
//    }
//
//    @GetMapping
//    public List<Income> getIncome() {
//        return incomeService.getAllIncome();
//    }
//}


package com.example.expense_tracker.controller;

import com.example.expense_tracker.entity.Income;
import com.example.expense_tracker.service.IncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/incomes")  // plural to match your table
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    // Add income for a specific user
    @PostMapping("/user/{userId}")
    public Income addIncome(@PathVariable Long userId, @RequestBody Income income) {
        return incomeService.addIncomeForUser(userId, income);
    }

    // Get all incomes
    @GetMapping
    public List<Income> getAllIncome() {
        return incomeService.getAllIncome();
    }

    // Delete income by ID
    @DeleteMapping("/{incomeId}")
    public void deleteIncome(@PathVariable Long incomeId) {
        incomeService.deleteIncome(incomeId);
    }

    @PutMapping("/{incomeId}")
    public Income updateIncome(@PathVariable Long incomeId, @RequestBody Income income){
        return incomeService.updateIncome(incomeId, income);
    }
}