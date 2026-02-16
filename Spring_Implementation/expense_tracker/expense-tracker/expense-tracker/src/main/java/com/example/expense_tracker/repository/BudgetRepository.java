package com.example.expense_tracker.repository;


//public class BudgetRepository {
//}


import com.example.expense_tracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
}
