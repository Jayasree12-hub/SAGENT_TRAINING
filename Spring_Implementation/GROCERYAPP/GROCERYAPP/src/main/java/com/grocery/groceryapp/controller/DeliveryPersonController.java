package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.DeliveryPerson;
import com.grocery.groceryapp.service.DeliveryPersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-person")
public class DeliveryPersonController {

    @Autowired
    private DeliveryPersonService service;



    @PostMapping

    public DeliveryPerson save(

            @RequestParam Long storeId,

            @RequestBody DeliveryPerson dp

    ) {

        return service.save(storeId, dp);

    }



    @GetMapping

    public List<DeliveryPerson> getAll() {

        return service.getAll();

    }

}
