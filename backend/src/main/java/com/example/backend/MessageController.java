package com.example.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @PostMapping
    public Map<String, Object> sendMessage(@RequestBody Map<String, Object> body) {
        Long senderId = ((Number) body.get("senderId")).longValue();
        String receiverUsername = (String) body.get("receiverUsername");
        Long productId = body.get("productId") != null ? ((Number) body.get("productId")).longValue() : null;
        String content = (String) body.get("content");

        if (content == null || content.trim().isEmpty()) throw new RuntimeException("내용을 입력해주세요.");

        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("수신자를 찾을 수 없습니다."));

        if (senderId.equals(receiver.getId())) throw new RuntimeException("자신에게 쪽지를 보낼 수 없습니다.");

        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiver.getId());
        message.setProductId(productId);
        message.setContent(content.trim());
        message.setIsRead(false);
        messageRepository.save(message);

        return Map.of("success", true);
    }

    @GetMapping("/inbox")
    public List<Map<String, Object>> getInbox(@RequestParam Long userId) {
        List<Message> allMessages = messageRepository.findAllByUserId(userId);

        Map<String, Long> unreadCounts = new HashMap<>();
        for (Message m : allMessages) {
            if (m.getReceiverId().equals(userId) && Boolean.FALSE.equals(m.getIsRead())) {
                Long partnerId = m.getSenderId();
                String key = partnerId + "_" + m.getProductId();
                unreadCounts.merge(key, 1L, Long::sum);
            }
        }

        Map<String, Map<String, Object>> convMap = new LinkedHashMap<>();
        for (Message m : allMessages) {
            Long partnerId = m.getSenderId().equals(userId) ? m.getReceiverId() : m.getSenderId();
            String key = partnerId + "_" + m.getProductId();
            if (!convMap.containsKey(key)) {
                Map<String, Object> conv = new HashMap<>();
                conv.put("partnerId", partnerId);
                conv.put("productId", m.getProductId());
                userRepository.findById(partnerId).ifPresent(u -> conv.put("partnerUsername", u.getUsername()));
                if (m.getProductId() != null) {
                    productRepository.findById(m.getProductId()).ifPresent(p -> conv.put("productName", p.getName()));
                }
                conv.put("lastMessage", m.getContent());
                conv.put("lastMessageAt", m.getCreatedAt() != null ? m.getCreatedAt().toString() : null);
                conv.put("unreadCount", unreadCounts.getOrDefault(key, 0L));
                convMap.put(key, conv);
            }
        }
        return new ArrayList<>(convMap.values());
    }

    @GetMapping("/conversation")
    public List<Map<String, Object>> getConversation(
            @RequestParam Long userId,
            @RequestParam Long partnerId,
            @RequestParam Long productId) {
        List<Message> messages = messageRepository.findConversation(userId, partnerId, productId);

        messages.stream()
                .filter(m -> m.getReceiverId().equals(userId) && Boolean.FALSE.equals(m.getIsRead()))
                .forEach(m -> m.setIsRead(true));
        messageRepository.saveAll(messages);

        return messages.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("senderId", m.getSenderId());
            map.put("receiverId", m.getReceiverId());
            map.put("productId", m.getProductId());
            map.put("content", m.getContent());
            map.put("createdAt", m.getCreatedAt() != null ? m.getCreatedAt().toString() : null);
            map.put("isRead", m.getIsRead());
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@RequestParam Long userId) {
        return Map.of("count", messageRepository.countUnread(userId));
    }
}
