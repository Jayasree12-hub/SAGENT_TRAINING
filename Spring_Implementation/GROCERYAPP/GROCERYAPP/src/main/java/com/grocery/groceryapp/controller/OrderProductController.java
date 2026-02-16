package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.OrderProduct;
import com.grocery.groceryapp.service.OrderProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-products")
public class OrderProductController {


    @Autowired
    private OrderProductService service;



    @PostMapping

    public OrderProduct add(

            @RequestParam Long orderId,

            @RequestParam Long productId,

            @RequestParam int quantity,

            @RequestParam double price

    ) {

        return service.addProduct(
                orderId,
                productId,
                quantity,
                price
        );

    }



    @GetMapping("/{orderId}")

    public List<OrderProduct> get(

            @PathVariable Long orderId

    ) {

        return service.getByOrder(orderId);

    }



    @DeleteMapping

    public String delete(

            @RequestParam Long orderId,

            @RequestParam Long productId

    ) {

        service.delete(orderId, productId);

        return "Deleted";

    }

}

