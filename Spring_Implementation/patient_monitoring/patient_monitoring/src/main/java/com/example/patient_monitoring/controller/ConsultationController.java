package com.example.patient_monitoring.controller;

import com.example.patient_monitoring.entity.Consultation;
import com.example.patient_monitoring.service.ConsultationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consultations")
public class ConsultationController {

    private final ConsultationService consultationService;

    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @GetMapping
    public List<Consultation> getAllConsultations() {
        return consultationService.getAllConsultations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Consultation> getConsultationById(@PathVariable Integer id) {
        return consultationService.getConsultationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create consultation: pass doctorId and patientId as request params
    @PostMapping
    public Consultation createConsultation(@RequestParam Integer doctorId,
                                           @RequestParam Integer patientId,
                                           @RequestBody Consultation consultation) {
        return consultationService.createConsultation(doctorId, patientId, consultation);
    }

    @PutMapping("/{id}")
    public Consultation updateConsultation(@PathVariable Integer id,
                                           @RequestParam Integer doctorId,
                                           @RequestParam Integer patientId,
                                           @RequestBody Consultation consultation) {
        return consultationService.updateConsultation(id, doctorId, patientId, consultation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConsultation(@PathVariable Integer id) {
        consultationService.deleteConsultation(id);
        return ResponseEntity.noContent().build();
    }
}
