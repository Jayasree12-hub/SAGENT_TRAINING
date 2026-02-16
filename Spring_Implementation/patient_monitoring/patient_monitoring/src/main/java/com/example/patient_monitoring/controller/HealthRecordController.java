package com.example.patient_monitoring.controller;

import com.example.patient_monitoring.entity.HealthRecord;
import com.example.patient_monitoring.service.HealthRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/health-records")
public class HealthRecordController {

    private final HealthRecordService healthRecordService;

    public HealthRecordController(HealthRecordService healthRecordService) {
        this.healthRecordService = healthRecordService;
    }

    @GetMapping
    public List<HealthRecord> getAllHealthRecords() {
        return healthRecordService.getAllHealthRecords();
    }

    @GetMapping("/{id}")
    public ResponseEntity<HealthRecord> getHealthRecordById(@PathVariable Integer id) {
        return healthRecordService.getHealthRecordById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create HealthRecord: pass patientId as request param and record in body
    @PostMapping
    public HealthRecord createHealthRecord(@RequestParam Integer patientId, @RequestBody HealthRecord healthRecord) {
        return healthRecordService.createHealthRecord(patientId, healthRecord);
    }

    @PutMapping("/{id}")
    public HealthRecord updateHealthRecord(@PathVariable Integer id, @RequestBody HealthRecord healthRecord) {
        return healthRecordService.updateHealthRecord(id, healthRecord);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHealthRecord(@PathVariable Integer id) {
        healthRecordService.deleteHealthRecord(id);
        return ResponseEntity.noContent().build();
    }
}
