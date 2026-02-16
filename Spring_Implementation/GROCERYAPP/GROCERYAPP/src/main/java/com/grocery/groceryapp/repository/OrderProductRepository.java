package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.OrderProduct;
import com.grocery.groceryapp.entity.OrderProductKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderProductRepository extends JpaRepository<OrderProduct, OrderProductKey> {

    List<OrderProduct> findByOrderOrderId(Long orderId);

}
