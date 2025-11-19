package com.verduleria.app_verduleria.controllers;

import com.verduleria.app_verduleria.dtos.ProductoDto;
import com.verduleria.app_verduleria.services.ProductoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping("/all")
    public ResponseEntity<List<ProductoDto>> getAllProductos(@RequestParam(required = false) String search) {
        List<ProductoDto> productos;
        if (search != null && !search.isEmpty()) {
            productos = productoService.findByCriteria(search);
        } else {
            productos = productoService.findAll();
        }
        return new ResponseEntity<>(productos, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDto> getProductoById(@PathVariable Long id) {
        ProductoDto productoDto = productoService.findById(id);
        return new ResponseEntity<>(productoDto, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ProductoDto> createProducto(@Valid @RequestBody ProductoDto productoDto) {
        ProductoDto savedProducto = productoService.save(productoDto);
        return new ResponseEntity<>(savedProducto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoDto> updateProducto(@PathVariable Long id, @Valid @RequestBody ProductoDto productoDto) {
        ProductoDto updatedProducto = productoService.update(id, productoDto);
        return new ResponseEntity<>(updatedProducto, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProducto(@PathVariable Long id) {
        productoService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
