package com.eventapp.service;

import com.eventapp.entity.DirectMessage;
import com.eventapp.repository.DirectMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DirectMessageService {
    private final DirectMessageRepository directMessageRepository;

    public List<DirectMessage> getAll() { return directMessageRepository.findAll(); }

    public Optional<DirectMessage> getById(Integer id) { return directMessageRepository.findById(id); }

    public DirectMessage create(DirectMessage dm) { return directMessageRepository.save(dm); }

    public DirectMessage update(Integer id, DirectMessage updated) {
        return directMessageRepository.findById(id).map(dm -> {
            dm.setEvent(updated.getEvent());
            dm.setSender(updated.getSender());
            dm.setReceiver(updated.getReceiver());
            dm.setMessageText(updated.getMessageText());
            dm.setSentAt(updated.getSentAt());
            return directMessageRepository.save(dm);
        }).orElseThrow(() -> new RuntimeException("DirectMessage not found: " + id));
    }

    public void delete(Integer id) { directMessageRepository.deleteById(id); }

    public List<DirectMessage> getByEvent(Integer eventId) { return directMessageRepository.findByEvent_EventId(eventId); }

    public List<DirectMessage> getConversation(Integer senderId, Integer receiverId) {
        return directMessageRepository.findBySender_UserIdAndReceiver_UserId(senderId, receiverId);
    }
}
