package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.Order;
import com.grocery.groceryapp.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;



    // CREATE

    @PostMapping

    public Order createOrder(

            @RequestParam Long customerId,
            @RequestParam Long storeId,
            @RequestParam Long deliveryId,

            @RequestBody Order order

    ) {

        return orderService.createOrder(customerId, storeId, deliveryId, order);

    }



    // GET ALL

    @GetMapping

    public List<Order> getAllOrders() {

        return orderService.getAllOrders();

    }



    // GET BY ID

    @GetMapping("/{id}")

    public Order getOrder(@PathVariable Long id) {

        return orderService.getOrderById(id);

    }



    // DELETE

    @DeleteMapping("/{id}")

    public String deleteOrder(@PathVariable Long id) {

        orderService.deleteOrder(id);

        return "Order deleted successfully";

    }

}

