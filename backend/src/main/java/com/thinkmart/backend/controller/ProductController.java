package com.thinkmart.backend.controller;

import com.thinkmart.backend.model.Product;
import com.thinkmart.backend.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository products;

    public ProductController(ProductRepository products) {
        this.products = products;
    }

    @GetMapping
    public List<ProductResponse> getProducts() {
        return products.findAll().stream()
                .map(product -> new ProductResponse(
                        product.getId(),
                        product.getName(),
                        product.getDescription(),
                        product.getImageUrl(),
                        product.getPrice(),
                        product.getMrp(),
                        product.getRating()))
                .toList();
    }

    public record ProductResponse(
            Long id,
            String name,
            String description,
            String imageUrl,
            BigDecimal price,
            BigDecimal mrp,
            BigDecimal rating) {
    }
}
