package com.example.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class WishController {

    private final WishRepository wishRepository;
    private final ProductRepository productRepository;

    @PostMapping("/{productId}")
    @Transactional
    public Map<String, Object> toggleWish(
            @PathVariable Long productId,
            @RequestBody Map<String, Long> body) {

        Long userId = body.get("userId");
        boolean alreadyWished = wishRepository.existsByUserIdAndProductId(userId, productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        if (alreadyWished) {
            wishRepository.deleteByUserIdAndProductId(userId, productId);
            product.setWishCount(Math.max(0, product.getWishCount() - 1));
        } else {
            wishRepository.save(new Wish(null, userId, productId));
            product.setWishCount(product.getWishCount() + 1);
        }
        productRepository.save(product);

        return Map.of("wished", !alreadyWished, "wishCount", product.getWishCount());
    }

    @GetMapping("/user/{userId}")
    public List<Long> getUserWishes(@PathVariable Long userId) {
        return wishRepository.findByUserId(userId).stream()
                .map(Wish::getProductId)
                .collect(Collectors.toList());
    }
}
