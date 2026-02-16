package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.Cart;
import com.grocery.groceryapp.entity.Customer;
import com.grocery.groceryapp.repository.CartRepository;
import com.grocery.groceryapp.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CustomerRepository customerRepository;

    // CREATE cart for a customer
    public Cart addCart(Cart cart, Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
        cart.setCustomer(customer);
        return cartRepository.save(cart);
    }

    // GET all carts
    public List<Cart> getAllCarts() {
        return cartRepository.findAll();
    }

    // GET cart by ID
    public Cart getCartById(Long cartId) {
        return cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with ID: " + cartId));
    }

    // UPDATE cart
    public Cart updateCart(Long cartId, Cart cartDetails) {
        Cart cart = getCartById(cartId);
        cart.setTotalAmount(cartDetails.getTotalAmount());
        cart.setTotalItems(cartDetails.getTotalItems());
        cart.setDiscount(cartDetails.getDiscount());
        return cartRepository.save(cart);
    }

    // DELETE cart
    public void deleteCart(Long cartId) {
        cartRepository.deleteById(cartId);
    }

    // GET carts by customer
    public List<Cart> getCartsByCustomer(Long customerId) {
        return cartRepository.findByCustomerCustomerId(customerId);
    }
}

