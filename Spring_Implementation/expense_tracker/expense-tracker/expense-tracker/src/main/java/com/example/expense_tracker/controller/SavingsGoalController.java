//package com.example.expense_tracker.controller;
//
////public class SavingsGoalController {
////}
//
//
//import com.example.expense_tracker.entity.SavingsGoal;
//import com.example.expense_tracker.service.SavingsGoalService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/savings")
//@RequiredArgsConstructor
//public class SavingsGoalController {
//
//    private final SavingsGoalService service;
//
//    @PostMapping
//    public SavingsGoal createGoal(@RequestBody SavingsGoal goal){
//        return service.createGoal(goal);
//    }
//
//    @GetMapping
//    public List<SavingsGoal> getGoals(){
//        return service.getGoals();
//    }
//}


package com.example.expense_tracker.controller;

import com.example.expense_tracker.entity.SavingsGoal;
import com.example.expense_tracker.service.SavingsGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/savings-goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService service;

    @PostMapping("/user/{userId}")
    public SavingsGoal createSavingsGoal(@PathVariable Long userId, @RequestBody SavingsGoal goal){
        return service.createSavingsGoal(userId, goal);
    }

    @GetMapping
    public List<SavingsGoal> getSavingsGoals(){
        return service.getSavingsGoals();
    }

    @DeleteMapping("/{goalId}")
    public String deleteSavingsGoal(@PathVariable Long goalId){
        service.deleteSavingsGoal(goalId);
        return "Savings goal deleted successfully";
    }

    @PutMapping("/{goalId}")
    public SavingsGoal updateSavingsGoal(@PathVariable Long goalId, @RequestBody SavingsGoal goal){
        return service.updateSavingsGoal(goalId, goal);
    }
}