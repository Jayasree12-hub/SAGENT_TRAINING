package com.example.admission_system.controller;

import com.example.admission_system.entity.Document;
import com.example.admission_system.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService service;

    @PostMapping
    public Document create(@RequestBody Document document){
        return service.save(document);
    }

    @GetMapping
    public List<Document> getAll(){
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Document getById(@PathVariable Long id){
        return service.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        service.delete(id);
    }
}
