package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.CartProduct;
import com.grocery.groceryapp.service.CartProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart-products")
public class CartProductController {

    @Autowired
    private CartProductService cartProductService;



    // ADD product to cart

    @PostMapping

    public CartProduct addProduct(

            @RequestParam Long cartId,

            @RequestParam Long productId,

            @RequestParam int quantity,

            @RequestParam double price

    ) {

        return cartProductService.addProductToCart(cartId, productId, quantity, price);

    }



    // GET all products in cart

    @GetMapping("/{cartId}")

    public List<CartProduct> getProducts(

            @PathVariable Long cartId

    ) {

        return cartProductService.getProductsByCart(cartId);

    }



    // DELETE product

    @DeleteMapping

    public String deleteProduct(

            @RequestParam Long cartId,

            @RequestParam Long productId

    ) {

        cartProductService.deleteProduct(cartId, productId);

        return "Product removed from cart";

    }

}
