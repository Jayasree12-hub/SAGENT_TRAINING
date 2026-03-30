package com.eventapp.service;

import com.eventapp.entity.Task;
import com.eventapp.entity.User;
import com.eventapp.entity.Notification;
import com.eventapp.repository.TaskRepository;
import com.eventapp.repository.UserRepository;
import com.eventapp.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public List<Task> getAll() { return taskRepository.findAll(); }

    public Optional<Task> getById(Integer id) { return taskRepository.findById(id); }

    public Task create(Task task) {
        if (task.getCreatedAt() == null) {
            task.setCreatedAt(LocalDateTime.now());
        }
        task.setUpdatedAt(LocalDateTime.now());

        Task saved = taskRepository.save(task);
        if (saved.getAssignedTo() != null) {
            createNotification(
                    saved.getAssignedTo(),
                    "New task assigned: " + saved.getTitle(),
                    "TASK_ASSIGNED"
            );
        }
        return saved;
    }

    public Task update(Integer id, Task updated) {
        return taskRepository.findById(id).map(t -> {
            User previousAssigned = t.getAssignedTo();
            t.setEvent(updated.getEvent());
            t.setAssignedTo(updated.getAssignedTo());
            t.setTitle(updated.getTitle());
            t.setDescription(updated.getDescription());
            t.setDeadline(updated.getDeadline());
            t.setPriority(updated.getPriority());
            t.setStatus(updated.getStatus());
            t.setRejectionMessage(updated.getRejectionMessage());
            t.setUpdatedAt(LocalDateTime.now());
            if (updated.getAssignedTo() != null && (previousAssigned == null || !updated.getAssignedTo().getUserId().equals(previousAssigned.getUserId()))) {
                createNotification(
                        updated.getAssignedTo(),
                        "New task assigned: " + updated.getTitle(),
                        "TASK_ASSIGNED"
                );
            }
            return taskRepository.save(t);
        }).orElseThrow(() -> new RuntimeException("Task not found: " + id));
    }

    public void delete(Integer id) { taskRepository.deleteById(id); }

    public List<Task> getByEvent(Integer eventId) { return taskRepository.findByEvent_EventId(eventId); }

    public List<Task> getByAssignedUser(Integer userId) { return taskRepository.findByAssignedTo_UserId(userId); }

    public List<Task> getByStatus(String status) { return taskRepository.findByStatus(status); }

    public List<Task> getByAssignedEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return taskRepository.findByAssignedTo_UserId(user.getUserId());
    }

    public Task acceptTask(Integer taskId, String actorEmail) {
        Task task = getTaskForAssignee(taskId, actorEmail);
        if ("COMPLETED".equalsIgnoreCase(task.getStatus())) {
            throw new RuntimeException("Cannot accept a completed task");
        }
        if ("ACCEPTED".equalsIgnoreCase(task.getStatus())) {
            return task;
        }
        if (!isPendingStatus(task.getStatus())) {
            throw new RuntimeException("Task cannot be accepted");
        }
        task.setStatus("ACCEPTED");
        task.setRejectionMessage(null);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public Task rejectTask(Integer taskId, String actorEmail, String message) {
        if (message == null || message.trim().isEmpty()) {
            throw new RuntimeException("Reason required");
        }
        Task task = getTaskForAssignee(taskId, actorEmail);
        if ("COMPLETED".equalsIgnoreCase(task.getStatus())) {
            throw new RuntimeException("Cannot reject a completed task");
        }
        task.setStatus("REJECTED");
        task.setRejectionMessage(message.trim());
        task.setUpdatedAt(LocalDateTime.now());
        Task saved = taskRepository.save(task);
        if (saved.getEvent() != null && saved.getEvent().getOrganizer() != null) {
            createNotification(
                    saved.getEvent().getOrganizer(),
                    "Task rejected: " + saved.getTitle(),
                    "TASK_REJECTED"
            );
        }
        return saved;
    }

    public Task completeTask(Integer taskId, String actorEmail) {
        Task task = getTaskForAssignee(taskId, actorEmail);
        if (!"ACCEPTED".equalsIgnoreCase(task.getStatus())) {
            throw new RuntimeException("Task must be accepted before completion");
        }
        task.setStatus("COMPLETED");
        task.setUpdatedAt(LocalDateTime.now());
        Task saved = taskRepository.save(task);
        if (saved.getEvent() != null && saved.getEvent().getOrganizer() != null) {
            createNotification(
                    saved.getEvent().getOrganizer(),
                    "Task completed: " + saved.getTitle(),
                    "TASK_COMPLETED"
            );
        }
        return saved;
    }

    public TeamMemberCounts getTeamMemberCounts(String actorEmail) {
        User user = userRepository.findByEmailIgnoreCase(actorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        long total = taskRepository.countByAssignedTo_UserId(user.getUserId());
        long completed = taskRepository.countByAssignedTo_UserIdAndStatus(user.getUserId(), "COMPLETED")
                + taskRepository.countByAssignedTo_UserIdAndStatus(user.getUserId(), "DONE");
        long pending = total - completed;
        return new TeamMemberCounts(total, completed, pending);
    }

    private Task getTaskForAssignee(Integer taskId, String actorEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if (task.getAssignedTo() == null || task.getAssignedTo().getEmail() == null) {
            throw new RuntimeException("Task is not assigned");
        }
        if (!task.getAssignedTo().getEmail().equalsIgnoreCase(actorEmail)) {
            throw new RuntimeException("Only the assigned user can update this task");
        }
        return task;
    }

    private boolean isPendingStatus(String status) {
        if (status == null || status.isBlank()) {
            return true;
        }
        String s = status.toUpperCase();
        return "PENDING".equals(s) || "TODO".equals(s);
    }

    private void createNotification(User user, String message, String type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    public static class TeamMemberCounts {
        private long assigned;
        private long completed;
        private long pending;

        public TeamMemberCounts(long assigned, long completed, long pending) {
            this.assigned = assigned;
            this.completed = completed;
            this.pending = pending;
        }

        public long getAssigned() { return assigned; }
        public long getCompleted() { return completed; }
        public long getPending() { return pending; }
    }
}
