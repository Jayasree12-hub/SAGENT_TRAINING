package com.eventapp.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ChatRealtimeService {
    private final Map<Integer, List<SseEmitter>> emittersByUser = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Integer userId) {
        SseEmitter emitter = new SseEmitter(0L);
        emittersByUser.computeIfAbsent(userId, ignored -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(error -> removeEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(Map.of(
                            "status", "connected",
                            "sentAt", LocalDateTime.now().toString()
                    )));
        } catch (IOException ignored) {
            removeEmitter(userId, emitter);
        }
        return emitter;
    }

    public void notifyUsers(Collection<Integer> userIds, String reason) {
        notifyUsers(userIds, Map.of(
                "reason", reason,
                "sentAt", LocalDateTime.now().toString()
        ));
    }

    public void notifyUsers(Collection<Integer> userIds, Map<String, ?> payload) {
        if (userIds == null || userIds.isEmpty()) {
            return;
        }
        for (Integer userId : userIds) {
            if (userId == null) {
                continue;
            }
            List<SseEmitter> emitters = emittersByUser.get(userId);
            if (emitters == null || emitters.isEmpty()) {
                continue;
            }

            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().name("chat-update").data(payload));
                } catch (IOException ignored) {
                    removeEmitter(userId, emitter);
                }
            }
        }
    }

    private void removeEmitter(Integer userId, SseEmitter emitter) {
        List<SseEmitter> emitters = emittersByUser.get(userId);
        if (emitters == null) {
            return;
        }
        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emittersByUser.remove(userId);
        }
    }
}
