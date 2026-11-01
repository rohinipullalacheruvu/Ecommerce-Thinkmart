package com.thinkmart.backend.config;

import com.thinkmart.backend.model.Product;
import com.thinkmart.backend.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ProductSeeder {
    @Bean
    CommandLineRunner seedProducts(ProductRepository products) {
        return args -> {
            if (products.count() > 0) {
                return;
            }

            products.saveAll(List.of(
                    new Product("HP Laptop", "Powerful laptop for students and professionals.",
                            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
                            new BigDecimal("55999.00"), new BigDecimal("65999.00"), new BigDecimal("4.5")),
                    new Product("Samsung Galaxy", "Stylish smartphone with powerful performance.",
                            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
                            new BigDecimal("29999.00"), new BigDecimal("37999.00"), new BigDecimal("4.6")),
                    new Product("Smart Watch", "Track fitness, calls and notifications.",
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
                            new BigDecimal("2999.00"), new BigDecimal("3999.00"), new BigDecimal("4.3")),
                    new Product("Wireless Headphones", "Enjoy immersive music with clear sound.",
                            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
                            new BigDecimal("1999.00"), new BigDecimal("2999.00"), new BigDecimal("4.7")),
                    new Product("Running Shoes", "Comfortable and stylish shoes for daily use.",
                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
                            new BigDecimal("1799.00"), new BigDecimal("1999.00"), new BigDecimal("4.2")),
                    new Product("Digital Camera", "Capture your memorable moments in high quality.",
                            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
                            new BigDecimal("42999.00"), new BigDecimal("51999.00"), new BigDecimal("4.6"))));
        };
    }
}
