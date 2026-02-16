package com.example.expense_tracker.repository;

//public class IncomeRepository {
//}


import com.example.expense_tracker.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeRepository extends JpaRepository<Income, Long> {
}
