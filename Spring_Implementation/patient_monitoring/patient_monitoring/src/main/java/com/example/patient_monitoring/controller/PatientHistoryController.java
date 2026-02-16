package com.example.patient_monitoring.controller;

import com.example.patient_monitoring.entity.PatientHistory;
import com.example.patient_monitoring.service.PatientHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patient-histories")
public class PatientHistoryController {

    private final PatientHistoryService patientHistoryService;

    public PatientHistoryController(PatientHistoryService patientHistoryService) {
        this.patientHistoryService = patientHistoryService;
    }

    @GetMapping
    public List<PatientHistory> getAllHistories() {
        return patientHistoryService.getAllHistories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientHistory> getHistoryById(@PathVariable Integer id) {
        return patientHistoryService.getHistoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PatientHistory> createHistory(@RequestParam Integer patientId,
                                                        @RequestParam Integer doctorId,
                                                        @RequestBody PatientHistory history) {
        PatientHistory created = patientHistoryService.createHistory(patientId, doctorId, history);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientHistory> updateHistory(@PathVariable Integer id,
                                                        @RequestBody PatientHistory history) {
        PatientHistory updated = patientHistoryService.updateHistory(id, history);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Integer id) {
        patientHistoryService.deleteHistory(id);
        return ResponseEntity.noContent().build();
    }
}
