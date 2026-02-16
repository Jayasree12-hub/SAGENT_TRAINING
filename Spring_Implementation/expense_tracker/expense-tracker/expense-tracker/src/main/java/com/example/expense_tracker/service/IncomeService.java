//package com.example.expense_tracker.service;
//
////public class IncomeService {
////}
//
//
//
//import com.example.expense_tracker.entity.Income;
//import com.example.expense_tracker.repository.IncomeRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class IncomeService {
//
//    private final IncomeRepository incomeRepository;
//
//    public Income addIncome(Income income) {
//        return incomeRepository.save(income);
//    }
//
//    public List<Income> getAllIncome() {
//        return incomeRepository.findAll();
//    }
//
//    public Income addIncomeForUser(Long userId, Income income) {
//        income.setUserId(userId); // set user
//        return incomeRepository.save(income);
//    }
//
//    public void deleteIncome(Long incomeId) {
//        incomeRepository.deleteById(incomeId);
//    }
//}



package com.example.expense_tracker.service;

import com.example.expense_tracker.entity.Income;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.IncomeRepository;
import com.example.expense_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    // Add income for a specific user
    public Income addIncomeForUser(Long userId, Income income) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        income.setUser(user);  // set the User object
        return incomeRepository.save(income);
    }

    // Get all incomes
    public List<Income> getAllIncome() {
        return incomeRepository.findAll();
    }

    // Delete income by ID
    public void deleteIncome(Long incomeId) {
        incomeRepository.deleteById(incomeId);
    }

    public Income updateIncome(Long incomeId, Income updatedIncome) {
        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new RuntimeException("Income not found"));

        income.setAmount(updatedIncome.getAmount());
        income.setSource(updatedIncome.getSource());
        income.setIncomeDate(updatedIncome.getIncomeDate());

        return incomeRepository.save(income);
    }
}