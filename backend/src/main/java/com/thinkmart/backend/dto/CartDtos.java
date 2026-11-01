package com.thinkmart.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public final class CartDtos {
    private CartDtos() {
    }

    public record AddItemRequest(@NotNull Long productId, @Min(1) int quantity) {
    }

    public record QuantityRequest(@Min(1) int quantity) {
    }

    public record CartLine(
            Long productId,
            String name,
            String description,
            String imageUrl,
            BigDecimal price,
            int quantity,
            BigDecimal lineTotal) {
    }

    public record CartResponse(List<CartLine> items, BigDecimal subtotal) {
    }
}
