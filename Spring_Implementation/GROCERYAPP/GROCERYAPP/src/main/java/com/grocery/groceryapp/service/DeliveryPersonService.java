package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.DeliveryPerson;
import com.grocery.groceryapp.entity.Store;
import com.grocery.groceryapp.repository.DeliveryPersonRepository;
import com.grocery.groceryapp.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeliveryPersonService {

    @Autowired
    private DeliveryPersonRepository repository;

    @Autowired
    private StoreRepository storeRepository;



    public DeliveryPerson save(Long storeId, DeliveryPerson dp) {

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        dp.setStore(store);

        return repository.save(dp);

    }



    public List<DeliveryPerson> getAll() {

        return repository.findAll();

    }

}
