package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.*;
import com.grocery.groceryapp.repository.CartProductRepository;
import com.grocery.groceryapp.repository.CartRepository;
import com.grocery.groceryapp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartProductService {

    @Autowired
    private CartProductRepository cartProductRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;


    // ADD product to cart

    public CartProduct addProductToCart(Long cartId, Long productId, int quantity, double price) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartProduct cartProduct = new CartProduct();

        CartProductKey key = new CartProductKey(cartId, productId);

        cartProduct.setId(key);
        cartProduct.setCart(cart);
        cartProduct.setProduct(product);
        cartProduct.setQuantity(quantity);
        cartProduct.setPrice(price);

        return cartProductRepository.save(cartProduct);
    }



    // GET products in cart

    public List<CartProduct> getProductsByCart(Long cartId) {

        return cartProductRepository.findByCartCartId(cartId);

    }



    // DELETE product from cart

    public void deleteProduct(Long cartId, Long productId) {

        CartProductKey key = new CartProductKey(cartId, productId);

        cartProductRepository.deleteById(key);

    }

}
