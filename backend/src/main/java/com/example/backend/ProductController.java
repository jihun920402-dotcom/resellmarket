package com.example.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;

    private String uploadPath = Paths.get(System.getProperty("user.dir")).getParent().resolve("uploads").toString() + File.separator;

    @GetMapping
    public List<Product> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tradeType,
            @RequestParam(defaultValue = "latest") String sort) {

        List<Product> products = productRepository.findAll();

        if (keyword != null && !keyword.isBlank()) {
            products = products.stream()
                    .filter(p -> p.getName() != null && p.getName().contains(keyword))
                    .collect(Collectors.toList());
        }
        if (category != null && !category.isBlank()) {
            Category cat = Category.valueOf(category);
            products = products.stream()
                    .filter(p -> p.getCategory() == cat)
                    .collect(Collectors.toList());
        }
        if (tradeType != null && !tradeType.isBlank()) {
            TradeType tt = TradeType.valueOf(tradeType);
            products = products.stream()
                    .filter(p -> p.getTradeType() == tt || p.getTradeType() == TradeType.BOTH)
                    .collect(Collectors.toList());
        }

        Comparator<Product> comparator = switch (sort) {
            case "price_asc"  -> Comparator.comparing(Product::getPrice, Comparator.nullsLast(Comparator.naturalOrder()));
            case "price_desc" -> Comparator.comparing(Product::getPrice, Comparator.nullsLast(Comparator.reverseOrder()));
            default           -> Comparator.comparing(Product::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
        };
        products.sort(comparator);

        return products;
    }

    @PostMapping
    public Product createProduct(
            @RequestParam("name") String name,
            @RequestParam("price") Long price,
            @RequestParam("seller") String seller,
            @RequestParam("address") String address,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", defaultValue = "OTHER") String category,
            @RequestParam(value = "tradeType", defaultValue = "BOTH") String tradeType,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) throws IOException {

        Product product = new Product();
        product.setName(name);
        product.setPrice(price);
        product.setSeller(seller);
        product.setAddress(address);
        product.setDescription(description);
        product.setCategory(Category.valueOf(category));
        product.setTradeType(TradeType.valueOf(tradeType));

        List<String> fileNames = saveImages(images);
        if (!fileNames.isEmpty()) {
            product.setImageNames(fileNames);
            product.setImageName(fileNames.get(0));
        } else {
            String single = saveImage(image);
            if (single != null) {
                product.setImageName(single);
                product.setImageNames(List.of(single));
            }
        }

        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long price,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tradeType,
            @RequestParam(required = false) String status,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) throws IOException {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        if (name != null) product.setName(name);
        if (price != null) product.setPrice(price);
        if (address != null) product.setAddress(address);
        if (description != null) product.setDescription(description);
        if (category != null) product.setCategory(Category.valueOf(category));
        if (tradeType != null) product.setTradeType(TradeType.valueOf(tradeType));
        if (status != null) product.setStatus(ProductStatus.valueOf(status));

        List<String> newFileNames = saveImages(images);
        if (!newFileNames.isEmpty()) {
            product.setImageNames(newFileNames);
            product.setImageName(newFileNames.get(0));
        } else if (image != null && !image.isEmpty()) {
            String single = saveImage(image);
            if (single != null) {
                product.setImageName(single);
                product.setImageNames(List.of(single));
            }
        }

        return productRepository.save(product);
    }

    @PutMapping("/{id}/view")
    public Product incrementView(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));
        product.setViewCount((product.getViewCount() == null ? 0 : product.getViewCount()) + 1);
        return productRepository.save(product);
    }

    @PutMapping("/{id}/bump")
    public Map<String, Object> bumpProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        if (product.getLastBumpedAt() != null &&
            product.getLastBumpedAt().isAfter(LocalDateTime.now().minusHours(1))) {
            throw new RuntimeException("끌어올리기는 1시간에 한 번만 가능합니다.");
        }

        LocalDateTime now = LocalDateTime.now();
        product.setCreatedAt(now);
        product.setLastBumpedAt(now);
        productRepository.save(product);
        return Map.of("success", true);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
    }

    private String saveImage(MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) return null;
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) uploadDir.mkdirs();
        String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        image.transferTo(new File(uploadPath + fileName));
        return fileName;
    }

    private List<String> saveImages(List<MultipartFile> images) throws IOException {
        List<String> fileNames = new ArrayList<>();
        if (images == null) return fileNames;
        for (MultipartFile img : images) {
            if (img != null && !img.isEmpty()) {
                String name = saveImage(img);
                if (name != null) fileNames.add(name);
            }
        }
        return fileNames;
    }
}
