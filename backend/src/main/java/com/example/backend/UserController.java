package com.example.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @PostMapping("/register")
    public User register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        if (username == null || username.isBlank()) throw new RuntimeException("아이디를 입력해주세요.");
        if (password == null || password.isBlank()) throw new RuntimeException("비밀번호를 입력해주세요.");
        if (userRepository.findByUsername(username).isPresent()) throw new RuntimeException("이미 사용 중인 아이디입니다.");
        return userRepository.save(new User(null, username, password, "USER", null));
    }

    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        return userRepository.findByUsernameAndPassword(username, password)
                .orElseThrow(() -> new RuntimeException("아이디 또는 비밀번호 오류"));
    }

    @PostMapping("/setup")
    public String setup() {
        userRepository.deleteAll();
        productRepository.deleteAll();

        userRepository.save(new User(null, "admin", "1234", "ADMIN", null));
        userRepository.save(new User(null, "user1", "1234", "USER", null));
        userRepository.save(new User(null, "user2", "1234", "USER", null));

        productRepository.save(createExampleProduct("빈티지 자전거", 150000L, "admin", "서울 강남구", "bike.jpg", Category.OTHER, "상태 양호한 빈티지 자전거입니다. 직거래 선호."));
        productRepository.save(createExampleProduct("중고 아이패드", 450000L, "user1", "대구 중구", "ipad.jpg", Category.ELECTRONICS, "아이패드 5세대, 케이스 포함. 배터리 90% 이상."));
        productRepository.save(createExampleProduct("캠핑용 의자", 30000L, "user2", "서울 마포구", "chair.jpg", Category.FURNITURE, "캠핑 2회 사용. 접이식, 가방 포함."));
        productRepository.save(createExampleProduct("나이키 운동화", 55000L, "user1", "부산 해운대구", "shoes.jpg", Category.CLOTHING, "나이키 에어맥스 270, 275mm. 착용 횟수 적음. 박스 포함."));
        productRepository.save(createExampleProduct("게이밍 키보드", 80000L, "user2", "서울 송파구", "keyboard.jpg", Category.ELECTRONICS, "기계식 키보드, 청축. 6개월 사용. 키캡 교체 없음."));
        productRepository.save(createExampleProduct("원목 책상", 120000L, "admin", "서울 노원구", "desk.jpg", Category.FURNITURE, "1인용 원목 책상, 서랍 2개. 이사로 인해 판매. 직거래만."));

        return "계정과 예시 상품 6개가 생성되었습니다. (폴더: uploads)";
    }

    private Product createExampleProduct(String name, Long price, String seller, String address, String imageName, Category category, String description) {
        Product p = new Product();
        p.setName(name);
        p.setPrice(price);
        p.setSeller(seller);
        p.setAddress(address);
        p.setImageName(imageName);
        p.setCategory(category);
        p.setDescription(description);
        return p;
    }
}
