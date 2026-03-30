package com.eventapp.controller;

import com.eventapp.entity.Task;
import com.eventapp.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @GetMapping
    public List<Task> getAll() { return taskService.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getById(@PathVariable Integer id) {
        return taskService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Task create(@RequestBody Task task) { return taskService.create(task); }

    @PutMapping("/{id}")
    public ResponseEntity<Task> update(@PathVariable Integer id, @RequestBody Task task) {
        try { return ResponseEntity.ok(taskService.update(id, task)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/event/{eventId}")
    public List<Task> getByEvent(@PathVariable Integer eventId) { return taskService.getByEvent(eventId); }

    @GetMapping("/assigned/{userId}")
    public List<Task> getByAssignedUser(@PathVariable Integer userId) { return taskService.getByAssignedUser(userId); }

    @GetMapping("/assigned/me")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public List<Task> getAssignedToMe(Authentication authentication) {
        return taskService.getByAssignedEmail(authentication.getName());
    }

    @GetMapping("/status/{status}")
    public List<Task> getByStatus(@PathVariable String status) { return taskService.getByStatus(status); }

    @PostMapping("/{taskId}/accept")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public ResponseEntity<TaskActionResponse> accept(@PathVariable Integer taskId, Authentication authentication) {
        try {
            Task task = taskService.acceptTask(taskId, authentication.getName());
            return ResponseEntity.ok(TaskActionResponse.from(task));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(TaskActionResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{taskId}/reject")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public ResponseEntity<TaskActionResponse> reject(@PathVariable Integer taskId,
                                                     @RequestBody RejectRequest request,
                                                     Authentication authentication) {
        try {
            Task task = taskService.rejectTask(taskId, authentication.getName(), request.getMessage());
            return ResponseEntity.ok(TaskActionResponse.from(task));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(TaskActionResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{taskId}/complete")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public ResponseEntity<TaskActionResponse> complete(@PathVariable Integer taskId, Authentication authentication) {
        try {
            Task task = taskService.completeTask(taskId, authentication.getName());
            return ResponseEntity.ok(TaskActionResponse.from(task));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(TaskActionResponse.error(e.getMessage()));
        }
    }

    public static class RejectRequest {
        private String message;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class TaskActionResponse {
        private Integer taskId;
        private String status;
        private String rejectionMessage;
        private String message;

        public static TaskActionResponse from(Task task) {
            TaskActionResponse res = new TaskActionResponse();
            res.taskId = task.getTaskId();
            res.status = task.getStatus();
            res.rejectionMessage = task.getRejectionMessage();
            return res;
        }

        public static TaskActionResponse error(String message) {
            TaskActionResponse res = new TaskActionResponse();
            res.message = message;
            return res;
        }

        public Integer getTaskId() { return taskId; }
        public String getStatus() { return status; }
        public String getRejectionMessage() { return rejectionMessage; }
        public String getMessage() { return message; }
    }
}
