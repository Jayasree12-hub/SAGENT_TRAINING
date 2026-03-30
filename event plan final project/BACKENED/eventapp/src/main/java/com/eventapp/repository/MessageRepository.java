package com.eventapp.repository;
import com.eventapp.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByForum_ForumId(Integer forumId);
    List<Message> findByForum_ForumIdOrderBySentAtAsc(Integer forumId);
    List<Message> findBySender_UserId(Integer senderId);
    Optional<Message> findTopByForum_ForumIdOrderBySentAtDesc(Integer forumId);
}
