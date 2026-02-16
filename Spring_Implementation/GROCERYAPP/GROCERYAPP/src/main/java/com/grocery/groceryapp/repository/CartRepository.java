package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // Get carts by customer
    List<Cart> findByCustomerCustomerId(Long customerId);
}
