package com.example.backend;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Long price;
    private String seller;
    private String address;
    private String imageName;

    @Lob
    private String description;

    @Enumerated(EnumType.STRING)
    private Category category = Category.OTHER;

    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.SELLING;

    private Integer wishCount = 0;
    private Integer viewCount = 0;

    private LocalDateTime createdAt;
    private LocalDateTime lastBumpedAt;

    @Enumerated(EnumType.STRING)
    private TradeType tradeType = TradeType.BOTH;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_name")
    private List<String> imageNames = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
