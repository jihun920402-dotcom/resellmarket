package com.example.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @GetMapping("/{username}/profile")
    public Map<String, Object> getUserProfile(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Product> products = productRepository.findAll().stream()
                .filter(p -> username.equals(p.getSeller()))
                .sorted(Comparator.comparing(Product::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        long sellingCount = products.stream().filter(p -> p.getStatus() == ProductStatus.SELLING).count();
        long soldCount    = products.stream().filter(p -> p.getStatus() == ProductStatus.SOLD).count();

        Map<String, Object> result = new HashMap<>();
        result.put("username",     user.getUsername());
        result.put("role",         user.getRole());
        result.put("createdAt",    user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        result.put("sellingCount", sellingCount);
        result.put("soldCount",    soldCount);
        result.put("products",     products);
        return result;
    }
}
