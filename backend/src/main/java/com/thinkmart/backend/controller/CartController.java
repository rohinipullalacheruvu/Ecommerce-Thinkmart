package com.thinkmart.backend.controller;

import com.thinkmart.backend.dto.CartDtos.AddItemRequest;
import com.thinkmart.backend.dto.CartDtos.CartLine;
import com.thinkmart.backend.dto.CartDtos.CartResponse;
import com.thinkmart.backend.dto.CartDtos.QuantityRequest;
import com.thinkmart.backend.model.AppUser;
import com.thinkmart.backend.model.CartItem;
import com.thinkmart.backend.model.Product;
import com.thinkmart.backend.repository.AppUserRepository;
import com.thinkmart.backend.repository.CartItemRepository;
import com.thinkmart.backend.repository.ProductRepository;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final AppUserRepository users;
    private final ProductRepository products;
    private final CartItemRepository cartItems;

    public CartController(AppUserRepository users, ProductRepository products, CartItemRepository cartItems) {
        this.users = users;
        this.products = products;
        this.cartItems = cartItems;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public CartResponse getCart(Authentication authentication) {
        AppUser user = currentUser(authentication);
        return toResponse(cartItems.findByUserIdOrderById(user.getId()));
    }

    @PostMapping("/items")
    @Transactional
    public CartResponse addItem(Authentication authentication, @Valid @RequestBody AddItemRequest request) {
        AppUser user = currentUser(authentication);
        Product product = products.findById(request.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        CartItem item = cartItems.findByUserIdAndProductId(user.getId(), product.getId())
                .orElseGet(() -> new CartItem(user, product, 0));
        item.setQuantity(item.getQuantity() + request.quantity());
        cartItems.save(item);
        return toResponse(cartItems.findByUserIdOrderById(user.getId()));
    }

    @PutMapping("/items/{productId}")
    @Transactional
    public CartResponse updateItem(
            Authentication authentication,
            @PathVariable Long productId,
            @Valid @RequestBody QuantityRequest request) {
        AppUser user = currentUser(authentication);
        CartItem item = cartItems.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
        item.setQuantity(request.quantity());
        return toResponse(cartItems.findByUserIdOrderById(user.getId()));
    }

    @DeleteMapping("/items/{productId}")
    @Transactional
    public CartResponse removeItem(Authentication authentication, @PathVariable Long productId) {
        AppUser user = currentUser(authentication);
        cartItems.deleteByUserIdAndProductId(user.getId(), productId);
        return toResponse(cartItems.findByUserIdOrderById(user.getId()));
    }

    private AppUser currentUser(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
    }

    private CartResponse toResponse(List<CartItem> items) {
        List<CartLine> lines = items.stream()
                .map(item -> new CartLine(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getDescription(),
                        item.getProduct().getImageUrl(),
                        item.getProduct().getPrice(),
                        item.getQuantity(),
                        item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))))
                .toList();
        BigDecimal subtotal = lines.stream()
                .map(CartLine::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(lines, subtotal);
    }
}
