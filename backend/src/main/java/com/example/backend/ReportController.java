package com.example.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @PostMapping
    public Report createReport(@RequestBody Map<String, Object> body) {
        Long productId  = ((Number) body.get("productId")).longValue();
        Long reporterId = ((Number) body.get("reporterId")).longValue();
        String reason   = (String) body.get("reason");

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (product.getSeller().equals(reporter.getUsername())) {
            throw new RuntimeException("본인 상품은 신고할 수 없습니다.");
        }
        if (reportRepository.existsByProductIdAndReporterId(productId, reporterId)) {
            throw new RuntimeException("이미 신고한 상품입니다.");
        }

        Report report = new Report();
        report.setProductId(productId);
        report.setReporterId(reporterId);
        report.setReason(reason);
        return reportRepository.save(report);
    }

    @GetMapping
    public List<Map<String, Object>> getAllReports(@RequestParam Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        if (!"ADMIN".equals(admin.getRole())) {
            throw new RuntimeException("권한이 없습니다.");
        }

        return reportRepository.findAll().stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id",        r.getId());
            map.put("productId", r.getProductId());
            map.put("reporterId",r.getReporterId());
            map.put("reason",    r.getReason());
            map.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
            productRepository.findById(r.getProductId())
                    .ifPresent(p -> map.put("productName", p.getName()));
            userRepository.findById(r.getReporterId())
                    .ifPresent(u -> map.put("reporterUsername", u.getUsername()));
            return map;
        }).collect(Collectors.toList());
    }
}
