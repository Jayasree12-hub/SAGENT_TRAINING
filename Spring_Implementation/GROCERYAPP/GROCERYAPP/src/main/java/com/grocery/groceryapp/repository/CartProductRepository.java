package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.CartProduct;
import com.grocery.groceryapp.entity.CartProductKey;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartProductRepository extends JpaRepository<CartProduct, CartProductKey> {

    List<CartProduct> findByCartCartId(Long cartId);

}
