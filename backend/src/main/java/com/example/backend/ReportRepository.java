package com.example.backend;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
    boolean existsByProductIdAndReporterId(Long productId, Long reporterId);
}
