package com.verduleria.app_verduleria.controllers;

import com.verduleria.app_verduleria.dtos.ClienteDto;
import com.verduleria.app_verduleria.services.ClienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @GetMapping("/all")
    public ResponseEntity<List<ClienteDto>> getAllClientes(@RequestParam(required = false) String search) {
        List<ClienteDto> clientes;
        if (search != null && !search.isEmpty()) {
            clientes = clienteService.findByCriteria(search);
        } else {
            clientes = clienteService.findAll();
        }
        return new ResponseEntity<>(clientes, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteDto> getClienteById(@PathVariable Long id) {
        ClienteDto clienteDto = clienteService.findById(id);
        return new ResponseEntity<>(clienteDto, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ClienteDto> createCliente(@Valid @RequestBody ClienteDto clienteDto) {
        ClienteDto savedCliente = clienteService.save(clienteDto);
        return new ResponseEntity<>(savedCliente, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteDto> updateCliente(@PathVariable Long id, @Valid @RequestBody ClienteDto clienteDto) {
        ClienteDto updatedCliente = clienteService.update(id, clienteDto);
        return new ResponseEntity<>(updatedCliente, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCliente(@PathVariable Long id) {
        clienteService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}