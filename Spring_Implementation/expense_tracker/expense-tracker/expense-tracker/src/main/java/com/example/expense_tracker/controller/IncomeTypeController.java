package com.example.expense_tracker.controller;

//public class IncomeTypeController {
//}

import com.example.expense_tracker.entity.IncomeType;
import com.example.expense_tracker.service.IncomeTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/income-types")
@RequiredArgsConstructor
public class IncomeTypeController {

    private final IncomeTypeService service;

    @PostMapping
    public IncomeType addType(@RequestBody IncomeType type){
        return service.addType(type);
    }

    @GetMapping
    public List<IncomeType> getTypes(){
        return service.getAllTypes();
    }
}
