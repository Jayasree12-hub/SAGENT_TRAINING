//package com.example.expense_tracker.service;
//
////public class ExpenseService {
////}
//
//
//
//import com.example.expense_tracker.entity.Expense;
//import com.example.expense_tracker.repository.ExpenseRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class ExpenseService {
//
//    private final ExpenseRepository expenseRepository;
//
//    public Expense addExpense(Expense expense) {
//        return expenseRepository.save(expense);
//    }
//
//    public List<Expense> getAllExpenses() {
//        return expenseRepository.findAll();
//    }
//}


package com.example.expense_tracker.service;

import com.example.expense_tracker.entity.Expense;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.ExpenseRepository;
import com.example.expense_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    // Add expense for a specific user
    public Expense addExpenseForUser(Long userId, Expense expense) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        expense.setUser(user);
        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Expense updateExpense(Long expenseId, Expense updatedExpense) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expense.setCategory(updatedExpense.getCategory());
        expense.setAmount(updatedExpense.getAmount());
        expense.setExpenseDate(updatedExpense.getExpenseDate());

        return expenseRepository.save(expense);
    }

}