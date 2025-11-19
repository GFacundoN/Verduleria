package com.verduleria.app_verduleria.controllers;

import com.verduleria.app_verduleria.dtos.PedidoDto;
import com.verduleria.app_verduleria.services.PedidoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @GetMapping("/all")
    public ResponseEntity<List<PedidoDto>> getAllPedidos(@RequestParam(required = false) String search) {
        List<PedidoDto> pedidos;
        if (search != null && !search.isEmpty()) {
            pedidos = pedidoService.findByCriteria(search);
        } else {
            pedidos = pedidoService.findAll();
        }
        return new ResponseEntity<>(pedidos, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoDto> getPedidoById(@PathVariable Long id) {
        PedidoDto pedidoDto = pedidoService.findById(id);
        return new ResponseEntity<>(pedidoDto, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<PedidoDto> createPedido(@Valid @RequestBody PedidoDto pedidoDto) {
        PedidoDto savedPedido = pedidoService.save(pedidoDto);
        return new ResponseEntity<>(savedPedido, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PedidoDto> updatePedido(@PathVariable Long id, @Valid @RequestBody PedidoDto pedidoDto) {
        PedidoDto updatedPedido = pedidoService.update(id, pedidoDto);
        return new ResponseEntity<>(updatedPedido, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePedido(@PathVariable Long id) {
        pedidoService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
