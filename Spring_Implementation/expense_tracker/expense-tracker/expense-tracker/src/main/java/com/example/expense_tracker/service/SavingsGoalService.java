//package com.example.expense_tracker.service;
//
////public class SavingsGoalService {
////}
//
//import com.example.expense_tracker.entity.SavingsGoal;
//import com.example.expense_tracker.repository.SavingsGoalRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class SavingsGoalService {
//
//    private final SavingsGoalRepository repository;
//
//    public SavingsGoal createGoal(SavingsGoal goal){
//        return repository.save(goal);
//    }
//
//    public List<SavingsGoal> getGoals(){
//        return repository.findAll();
//    }
//}


package com.example.expense_tracker.service;

import com.example.expense_tracker.entity.SavingsGoal;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.SavingsGoalRepository;
import com.example.expense_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final UserRepository userRepository;

    public SavingsGoal createSavingsGoal(Long userId, SavingsGoal goal) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        goal.setUser(user);
        return savingsGoalRepository.save(goal);
    }

    public List<SavingsGoal> getSavingsGoals() {
        return savingsGoalRepository.findAll();
    }

    public void deleteSavingsGoal(Long goalId) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        savingsGoalRepository.delete(goal);
    }

    public SavingsGoal updateSavingsGoal(Long goalId, SavingsGoal updatedGoal) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));

        goal.setGoalName(updatedGoal.getGoalName());
        goal.setTargetAmount(updatedGoal.getTargetAmount());
        goal.setSavedAmount(updatedGoal.getSavedAmount());
        goal.setDeadline(updatedGoal.getDeadline());

        return savingsGoalRepository.save(goal);
    }

}