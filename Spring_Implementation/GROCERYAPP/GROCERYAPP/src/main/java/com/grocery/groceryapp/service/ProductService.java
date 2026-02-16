package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.Product;
import com.grocery.groceryapp.entity.Store;
import com.grocery.groceryapp.repository.ProductRepository;
import com.grocery.groceryapp.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StoreRepository storeRepository;

    // CREATE with store
    public Product addProduct(Product product, Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found with ID: " + storeId));
        product.setStore(store);
        return productRepository.save(product);
    }

    // READ ALL
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // READ BY ID
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
    }

    // UPDATE
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));

        product.setProductName(productDetails.getProductName());
        product.setProductCategory(productDetails.getProductCategory());
        product.setProductPrice(productDetails.getProductPrice());
        product.setStockQuantity(productDetails.getStockQuantity());
        if (productDetails.getStore() != null) {
            product.setStore(productDetails.getStore());
        }

        return productRepository.save(product);
    }

    // DELETE
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // OPTIONAL: Get products by store
    public List<Product> getProductsByStore(Long storeId) {
        return productRepository.findByStoreStoreId(storeId);
    }

    // OPTIONAL: Get products by category
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByProductCategory(category);
    }
}
