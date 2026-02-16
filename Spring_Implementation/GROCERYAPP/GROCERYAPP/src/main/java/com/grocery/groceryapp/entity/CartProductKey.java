package com.grocery.groceryapp.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CartProductKey implements Serializable {

    private Long cartId;
    private Long productId;

    // Default constructor
    public CartProductKey() {
    }

    // Parameterized constructor
    public CartProductKey(Long cartId, Long productId) {
        this.cartId = cartId;
        this.productId = productId;
    }

    // Getters and Setters

    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }


    // equals and hashCode (VERY IMPORTANT)


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CartProductKey)) return false;
        CartProductKey that = (CartProductKey) o;
        return Objects.equals(cartId, that.cartId) &&
                Objects.equals(productId, that.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cartId, productId);
    }
}

