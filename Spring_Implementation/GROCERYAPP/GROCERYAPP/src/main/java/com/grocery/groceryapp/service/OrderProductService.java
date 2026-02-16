package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.*;
import com.grocery.groceryapp.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderProductService {


    @Autowired
    private OrderProductRepository repository;


    @Autowired
    private OrderRepository orderRepository;


    @Autowired
    private ProductRepository productRepository;



    public OrderProduct addProduct(Long orderId, Long productId,
                                   int quantity, double price) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));


        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));


        OrderProduct op = new OrderProduct();


        OrderProductKey key =
                new OrderProductKey(orderId, productId);


        op.setId(key);

        op.setOrder(order);

        op.setProduct(product);

        op.setQuantity(quantity);

        op.setPrice(price);


        return repository.save(op);

    }



    public List<OrderProduct> getByOrder(Long orderId) {

        return repository.findByOrderOrderId(orderId);

    }



    public void delete(Long orderId, Long productId) {

        repository.deleteById(
                new OrderProductKey(orderId, productId)
        );

    }

}
