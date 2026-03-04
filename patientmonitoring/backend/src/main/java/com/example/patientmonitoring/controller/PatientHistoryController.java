package com.example.patientmonitoring.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import com.example.patientmonitoring.entity.PatientHistory;
import com.example.patientmonitoring.service.PatientHistoryService;

@RestController
@RequestMapping("/patient-history")
public class PatientHistoryController {

    private final PatientHistoryService historyService;

    public PatientHistoryController(PatientHistoryService historyService) {
        this.historyService = historyService;
    }

    // CREATE
    @PostMapping("/{patientId}/{doctorId}")
    public PatientHistory create(@PathVariable Long patientId,
                                 @PathVariable Long doctorId,
                                 @RequestBody PatientHistory history) {
        return historyService.createHistory(patientId, doctorId, history);
    }

    // GET ALL
    @GetMapping
    public List<PatientHistory> getAll() {
        return historyService.getAllHistory();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public PatientHistory getById(@PathVariable Long id) {
        return historyService.getHistoryById(id);
    }

    // SEARCH BY PATIENT
    @GetMapping("/patient/{patientId}")
    public List<PatientHistory> getByPatient(@PathVariable Long patientId) {
        return historyService.getByPatientId(patientId);
    }

    // SEARCH BY DOCTOR
    @GetMapping("/doctor/{doctorId}")
    public List<PatientHistory> getByDoctor(@PathVariable Long doctorId) {
        return historyService.getByDoctorId(doctorId);
    }

    // SEARCH BY DATE
    @GetMapping("/date/{date}")
    public List<PatientHistory> getByDate(@PathVariable String date) {
        return historyService.getByDate(LocalDate.parse(date));
    }

    // UPDATE
    @PutMapping("/{id}")
    public PatientHistory update(@PathVariable Long id,
                                 @RequestBody PatientHistory history) {
        return historyService.updateHistory(id, history);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        historyService.deleteHistory(id);
        return "Patient history deleted successfully";
    }
}