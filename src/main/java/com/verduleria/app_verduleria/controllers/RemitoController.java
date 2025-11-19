package com.verduleria.app_verduleria.controllers;

import com.verduleria.app_verduleria.dtos.RemitoDto;
import com.verduleria.app_verduleria.services.RemitoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/remitos")
public class RemitoController {

    @Autowired
    private RemitoService remitoService;

    @GetMapping("/all")
    public ResponseEntity<List<RemitoDto>> getAllRemitos(@RequestParam(required = false) String search) {
        List<RemitoDto> remitos;
        if (search != null && !search.isEmpty()) {
            remitos = remitoService.findByCriteria(search);
        } else {
            remitos = remitoService.findAll();
        }
        return new ResponseEntity<>(remitos, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RemitoDto> getRemitoById(@PathVariable Long id) {
        RemitoDto remitoDto = remitoService.findById(id);
        return new ResponseEntity<>(remitoDto, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<RemitoDto> createRemito(@Valid @RequestBody RemitoDto remitoDto) {
        RemitoDto savedRemito = remitoService.save(remitoDto);
        return new ResponseEntity<>(savedRemito, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RemitoDto> updateRemito(@PathVariable Long id, @Valid @RequestBody RemitoDto remitoDto) {
        RemitoDto updatedRemito = remitoService.update(id, remitoDto);
        return new ResponseEntity<>(updatedRemito, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRemito(@PathVariable Long id) {
        remitoService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
