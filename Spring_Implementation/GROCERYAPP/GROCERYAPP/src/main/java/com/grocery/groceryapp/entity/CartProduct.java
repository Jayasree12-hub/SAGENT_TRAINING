package com.grocery.groceryapp.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cart_product")
public class CartProduct {

    @EmbeddedId
    private CartProductKey id;


    @ManyToOne
    @MapsId("cartId")
    @JoinColumn(name = "cart_id")
    private Cart cart;


    @ManyToOne
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private Product product;


    @Column(name = "quantity")
    private int quantity;


    @Column(name = "price")
    private double price;


    // Default constructor

    public CartProduct() {
    }


    // Getters and Setters


    public CartProductKey getId() {
        return id;
    }

    public void setId(CartProductKey id) {
        this.id = id;
    }


    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }


    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }


    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }


    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
