package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Get all products belonging to a specific store
    List<Product> findByStoreStoreId(Long storeId);

    // Get all products by category
    List<Product> findByProductCategory(String category);
}
