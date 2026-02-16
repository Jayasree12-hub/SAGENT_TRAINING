package com.example.expense_tracker.service;

//public class IncomeTypeService {
//}


import com.example.expense_tracker.entity.IncomeType;
import com.example.expense_tracker.repository.IncomeTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeTypeService {

    private final IncomeTypeRepository repository;

    public IncomeType addType(IncomeType type){
        return repository.save(type);
    }

    public List<IncomeType> getAllTypes(){
        return repository.findAll();
    }
}
