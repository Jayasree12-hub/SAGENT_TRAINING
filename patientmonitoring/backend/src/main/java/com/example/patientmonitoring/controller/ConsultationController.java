package com.example.patientmonitoring.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import com.example.patientmonitoring.entity.Consultation;
import com.example.patientmonitoring.service.ConsultationService;

@RestController
@RequestMapping("/consultations")
public class ConsultationController {

    private final ConsultationService consultationService;

    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    // CREATE
    @PostMapping("/{patientId}/{doctorId}/{appointmentId}")
    public Consultation create(@PathVariable Long patientId,
                               @PathVariable Long doctorId,
                               @PathVariable Long appointmentId,
                               @RequestBody Consultation consultation) {

        return consultationService.createConsultation(
                patientId, doctorId, appointmentId, consultation);
    }

    // GET ALL
    @GetMapping
    public List<Consultation> getAll() {
        return consultationService.getAllConsultations();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Consultation getById(@PathVariable Long id) {
        return consultationService.getConsultationById(id);
    }

    // SEARCH BY PATIENT
    @GetMapping("/patient/{patientId}")
    public List<Consultation> getByPatient(@PathVariable Long patientId) {
        return consultationService.getByPatientId(patientId);
    }

    // SEARCH BY DOCTOR
    @GetMapping("/doctor/{doctorId}")
    public List<Consultation> getByDoctor(@PathVariable Long doctorId) {
        return consultationService.getByDoctorId(doctorId);
    }

    // SEARCH BY DATE
    @GetMapping("/date/{date}")
    public List<Consultation> getByDate(@PathVariable String date) {
        return consultationService.getByDate(LocalDate.parse(date));
    }

    // UPDATE
    @PutMapping("/{id}")
    public Consultation update(@PathVariable Long id,
                               @RequestBody Consultation consultation) {
        return consultationService.updateConsultation(id, consultation);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        consultationService.deleteConsultation(id);
        return "Consultation deleted successfully";
    }
}