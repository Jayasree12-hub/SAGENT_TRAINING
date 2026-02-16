package com.grocery.groceryapp.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class OrderProductKey implements Serializable {

    private Long orderId;

    private Long productId;


    public OrderProductKey() {
    }

    public OrderProductKey(Long orderId, Long productId) {
        this.orderId = orderId;
        this.productId = productId;
    }


    public Long getOrderId() {
        return orderId;
    }

    public Long getProductId() {
        return productId;
    }


    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }


    @Override
    public boolean equals(Object o) {

        if (this == o) return true;

        if (!(o instanceof OrderProductKey)) return false;

        OrderProductKey that = (OrderProductKey) o;

        return Objects.equals(orderId, that.orderId)
                &&
                Objects.equals(productId, that.productId);

    }


    @Override
    public int hashCode() {

        return Objects.hash(orderId, productId);

    }

}
