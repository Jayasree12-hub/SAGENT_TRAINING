package com.eventapp.controller;

import com.eventapp.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DashboardController {

    private final TaskService taskService;

    @GetMapping("/team-member")
    @PreAuthorize("hasRole('TEAM_MEMBER')")
    public ResponseEntity<TeamMemberDashboardResponse> teamMemberDashboard(Authentication authentication) {
        TaskService.TeamMemberCounts counts = taskService.getTeamMemberCounts(authentication.getName());
        TeamMemberDashboardResponse response = new TeamMemberDashboardResponse(
                counts.getAssigned(),
                counts.getCompleted(),
                counts.getPending()
        );
        return ResponseEntity.ok(response);
    }

    public static class TeamMemberDashboardResponse {
        private long assigned;
        private long completed;
        private long pending;

        public TeamMemberDashboardResponse(long assigned, long completed, long pending) {
            this.assigned = assigned;
            this.completed = completed;
            this.pending = pending;
        }

        public long getAssigned() { return assigned; }
        public long getCompleted() { return completed; }
        public long getPending() { return pending; }
    }
}
