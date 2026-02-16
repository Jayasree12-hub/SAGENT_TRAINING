package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.Store;
import com.grocery.groceryapp.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StoreService {

    @Autowired
    private StoreRepository storeRepository;

    // Create Store
    public Store saveStore(Store store) {
        return storeRepository.save(store);
    }

    // Get all Stores
    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    // Get Store by ID
    public Store getStoreById(Long id) {
        return storeRepository.findById(id).orElse(null);
    }

    // Update Store
    public Store updateStore(Long id, Store store) {
        Store existing = storeRepository.findById(id).orElse(null);

        if (existing != null) {
            existing.setStoreName(store.getStoreName());
            existing.setStoreLocation(store.getStoreLocation());
            return storeRepository.save(existing);
        }

        return null;
    }

    // Delete Store
    public void deleteStore(Long id) {
        storeRepository.deleteById(id);
    }

}
