package com.example.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId ORDER BY m.createdAt DESC")
    List<Message> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE ((m.senderId = :userId AND m.receiverId = :partnerId) OR (m.senderId = :partnerId AND m.receiverId = :userId)) AND m.productId = :productId ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("userId") Long userId, @Param("partnerId") Long partnerId, @Param("productId") Long productId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :userId AND m.isRead = false")
    long countUnread(@Param("userId") Long userId);
}
