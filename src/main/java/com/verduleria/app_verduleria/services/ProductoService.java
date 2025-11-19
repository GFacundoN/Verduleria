package com.verduleria.app_verduleria.services;

import com.verduleria.app_verduleria.dtos.ProductoDto;
import com.verduleria.app_verduleria.entitys.Producto;
import com.verduleria.app_verduleria.repositorys.ProductoRepository;
import com.verduleria.app_verduleria.specifications.GenericSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public List<ProductoDto> findAll() {
        return productoRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoDto> findByCriteria(String search) {
        return productoRepository.findAll(new GenericSpecification<>(search)).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductoDto findById(Long id) {
        return productoRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    @Transactional
    public ProductoDto save(ProductoDto productoDto) {
        Producto producto = convertToEntity(productoDto);
        return convertToDto(productoRepository.save(producto));
    }

    @Transactional
    public ProductoDto update(Long id, ProductoDto productoDto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.setNombre(productoDto.getNombre());
        producto.setUnidadMedida(productoDto.getUnidadMedida());
        producto.setPrecioVenta(productoDto.getPrecioVenta());
        return convertToDto(productoRepository.save(producto));
    }

    @Transactional
    public void deleteById(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto con ID " + id + " no encontrado para eliminar.");
        }
        productoRepository.deleteById(id);
    }

    private ProductoDto convertToDto(Producto producto) {
        return new ProductoDto(
                producto.getId(),
                producto.getNombre(),
                producto.getUnidadMedida(),
                producto.getPrecioVenta()
        );
    }

    private Producto convertToEntity(ProductoDto dto) {
        Producto producto = new Producto();
        producto.setId(dto.getId());
        producto.setNombre(dto.getNombre());
        producto.setUnidadMedida(dto.getUnidadMedida());
        producto.setPrecioVenta(dto.getPrecioVenta());
        return producto;
    }
}
