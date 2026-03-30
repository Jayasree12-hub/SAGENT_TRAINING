package com.eventapp.service;

import com.eventapp.entity.Message;
import com.eventapp.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;

    public List<Message> getAll() { return messageRepository.findAll(); }

    public Optional<Message> getById(Integer id) { return messageRepository.findById(id); }

    public Message create(Message message) { return messageRepository.save(message); }

    public Message update(Integer id, Message updated) {
        return messageRepository.findById(id).map(m -> {
            m.setForum(updated.getForum());
            m.setSender(updated.getSender());
            m.setMessageText(updated.getMessageText());
            m.setSentAt(updated.getSentAt());
            return messageRepository.save(m);
        }).orElseThrow(() -> new RuntimeException("Message not found: " + id));
    }

    public void delete(Integer id) { messageRepository.deleteById(id); }

    public List<Message> getByForum(Integer forumId) { return messageRepository.findByForum_ForumId(forumId); }

    public List<Message> getBySender(Integer senderId) { return messageRepository.findBySender_UserId(senderId); }
}
