package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.Cart;
import com.grocery.groceryapp.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    @Autowired
    private CartService cartService;

    // Add cart for a customer
    @PostMapping("/customer/{customerId}")
    public ResponseEntity<Cart> addCart(@RequestBody Cart cart, @PathVariable Long customerId) {
        return ResponseEntity.ok(cartService.addCart(cart, customerId));
    }

    // Get all carts
    @GetMapping
    public ResponseEntity<List<Cart>> getAllCarts() {
        return ResponseEntity.ok(cartService.getAllCarts());
    }

    // Get cart by ID
    @GetMapping("/{cartId}")
    public ResponseEntity<Cart> getCartById(@PathVariable Long cartId) {
        return ResponseEntity.ok(cartService.getCartById(cartId));
    }

    // Update cart
    @PutMapping("/{cartId}")
    public ResponseEntity<Cart> updateCart(@PathVariable Long cartId, @RequestBody Cart cart) {
        return ResponseEntity.ok(cartService.updateCart(cartId, cart));
    }

    // Delete cart
    @DeleteMapping("/{cartId}")
    public ResponseEntity<String> deleteCart(@PathVariable Long cartId) {
        cartService.deleteCart(cartId);
        return ResponseEntity.ok("Cart deleted successfully");
    }

    // Get all carts of a customer
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Cart>> getCartsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(cartService.getCartsByCustomer(customerId));
    }
}
