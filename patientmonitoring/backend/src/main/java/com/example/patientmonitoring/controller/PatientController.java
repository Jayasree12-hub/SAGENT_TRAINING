package com.example.patientmonitoring.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import com.example.patientmonitoring.entity.Patient;
import com.example.patientmonitoring.service.PatientService;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    // CREATE
    @PostMapping
    public Patient createPatient(@RequestBody Patient patient) {
        return patientService.savePatient(patient);
    }

    // GET ALL
    @GetMapping
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable Long id) {
        return patientService.getPatientById(id);
    }

    // SEARCH BY NAME
    @GetMapping("/search/name/{name}")
    public List<Patient> searchByName(@PathVariable String name) {
        return patientService.searchByName(name);
    }

    // SEARCH BY EMAIL
    @GetMapping("/search/email/{email}")
    public Optional<Patient> searchByEmail(@PathVariable String email) {
        return patientService.searchByEmail(email);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable Long id,
                                 @RequestBody Patient patient) {
        return patientService.updatePatient(id, patient);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return "Patient deleted successfully";
    }
}