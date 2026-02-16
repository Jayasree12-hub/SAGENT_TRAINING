package com.example.admission_system.service;


import com.example.admission_system.entity.Document;
import com.example.admission_system.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository repository;

    public Document save(Document document){
        return repository.save(document);
    }

    public List<Document> getAll(){
        return repository.findAll();
    }

    public Document getById(Long id){
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    public void delete(Long id){
        repository.deleteById(id);
    }
}
