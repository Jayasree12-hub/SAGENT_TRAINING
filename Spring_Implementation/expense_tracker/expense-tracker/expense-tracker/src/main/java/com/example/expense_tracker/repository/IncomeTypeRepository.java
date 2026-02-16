package com.example.expense_tracker.repository;

//public class IncomeTypeRepository {
//}


import com.example.expense_tracker.entity.IncomeType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeTypeRepository extends JpaRepository<IncomeType, Long> {
}