package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.*;
import com.grocery.groceryapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private DeliveryPersonRepository deliveryPersonRepository;



    // CREATE ORDER

    public Order createOrder(Long customerId,
                             Long storeId,
                             Long deliveryId,
                             Order order) {


        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));


        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));


        DeliveryPerson deliveryPerson = deliveryPersonRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery person not found"));


        order.setCustomer(customer);
        order.setStore(store);
        order.setDeliveryPerson(deliveryPerson);

        order.setOrderDate(LocalDate.now());

        return orderRepository.save(order);

    }



    // GET ALL

    public List<Order> getAllOrders() {

        return orderRepository.findAll();

    }



    // GET BY ID

    public Order getOrderById(Long id) {

        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

    }



    // DELETE

    public void deleteOrder(Long id) {

        orderRepository.deleteById(id);

    }

}
