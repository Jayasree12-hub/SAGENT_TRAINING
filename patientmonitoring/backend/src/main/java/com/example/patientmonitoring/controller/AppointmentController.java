package com.example.patientmonitoring.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import com.example.patientmonitoring.entity.Appointment;
import com.example.patientmonitoring.service.AppointmentService;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // CREATE
    @PostMapping("/{doctorId}/{patientId}")
    public Appointment createAppointment(@PathVariable Long doctorId,
                                         @PathVariable Long patientId,
                                         @RequestBody Appointment appointment) {
        return appointmentService.createAppointment(doctorId, patientId, appointment);
    }

    // GET ALL
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Appointment getById(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id);
    }

    // SEARCH BY DOCTOR
    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getByDoctor(@PathVariable Long doctorId) {
        return appointmentService.getByDoctorId(doctorId);
    }

    // SEARCH BY PATIENT
    @GetMapping("/patient/{patientId}")
    public List<Appointment> getByPatient(@PathVariable Long patientId) {
        return appointmentService.getByPatientId(patientId);
    }

    // SEARCH BY DATE
    @GetMapping("/date/{date}")
    public List<Appointment> getByDate(@PathVariable String date) {
        return appointmentService.getByDate(LocalDate.parse(date));
    }

    // UPDATE
    @PutMapping("/{id}")
    public Appointment update(@PathVariable Long id,
                              @RequestBody Appointment appointment) {
        return appointmentService.updateAppointment(id, appointment);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return "Appointment deleted successfully";
    }
}