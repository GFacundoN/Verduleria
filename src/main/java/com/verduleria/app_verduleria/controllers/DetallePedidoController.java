package com.verduleria.app_verduleria.controllers;

import com.verduleria.app_verduleria.dtos.DetallePedidoDto;
import com.verduleria.app_verduleria.services.DetallePedidoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detalles-pedido")
public class DetallePedidoController {

    @Autowired
    private DetallePedidoService detallePedidoService;

    @GetMapping("/all")
    public ResponseEntity<List<DetallePedidoDto>> getAllDetalles(@RequestParam(required = false) String search) {
        List<DetallePedidoDto> detalles;
        if (search != null && !search.isEmpty()) {
            detalles = detallePedidoService.findByCriteria(search);
        } else {
            detalles = detallePedidoService.findAll();
        }
        return new ResponseEntity<>(detalles, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetallePedidoDto> getDetalleById(@PathVariable Long id) {
        DetallePedidoDto detalleDto = detallePedidoService.findById(id);
        return new ResponseEntity<>(detalleDto, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<DetallePedidoDto> createDetalle(@Valid @RequestBody DetallePedidoDto detalleDto) {
        DetallePedidoDto savedDetalle = detallePedidoService.save(detalleDto);
        return new ResponseEntity<>(savedDetalle, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetallePedidoDto> updateDetalle(@PathVariable Long id, @Valid @RequestBody DetallePedidoDto detalleDto) {
        DetallePedidoDto updatedDetalle = detallePedidoService.update(id, detalleDto);
        return new ResponseEntity<>(updatedDetalle, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetalle(@PathVariable Long id) {
        detallePedidoService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
