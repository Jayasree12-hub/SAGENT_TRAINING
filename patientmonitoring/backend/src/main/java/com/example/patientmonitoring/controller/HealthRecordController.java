package com.example.patientmonitoring.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import com.example.patientmonitoring.entity.HealthRecord;
import com.example.patientmonitoring.service.HealthRecordService;

@RestController
@RequestMapping("/health-records")
public class HealthRecordController {

    private final HealthRecordService recordService;

    public HealthRecordController(HealthRecordService recordService) {
        this.recordService = recordService;
    }

    // CREATE
    @PostMapping("/{patientId}")
    public HealthRecord create(@PathVariable Long patientId,
                               @RequestBody HealthRecord record) {
        return recordService.createRecord(patientId, record);
    }

    // GET ALL
    @GetMapping
    public List<HealthRecord> getAll() {
        return recordService.getAllRecords();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public HealthRecord getById(@PathVariable Long id) {
        return recordService.getRecordById(id);
    }

    // SEARCH BY PATIENT
    @GetMapping("/patient/{patientId}")
    public List<HealthRecord> getByPatient(@PathVariable Long patientId) {
        return recordService.getByPatientId(patientId);
    }

    // SEARCH BY DATE
    @GetMapping("/date/{date}")
    public List<HealthRecord> getByDate(@PathVariable String date) {
        return recordService.getByDate(LocalDate.parse(date));
    }

    // UPDATE
    @PutMapping("/{id}")
    public HealthRecord update(@PathVariable Long id,
                               @RequestBody HealthRecord record) {
        return recordService.updateRecord(id, record);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        recordService.deleteRecord(id);
        return "Health record deleted successfully";
    }
}