package com.verduleria.app_verduleria.services;

import com.verduleria.app_verduleria.entitys.Producto;
import com.verduleria.app_verduleria.repositorys.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Transactional
    public Producto guardarOActualizar(Producto producto) {

        return productoRepository.save(producto);
    }

    @Transactional(readOnly = true)
    public List<Producto> buscarTodos() {

        return productoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Producto> buscarPorId(Long id) {

        return productoRepository.findById(id);
    }

    @Transactional
    public void eliminarPorId(Long id) {

        if (productoRepository.existsById(id)) {

            productoRepository.deleteById(id);
        } else {

            throw new RuntimeException("Producto con ID " + id + " no encontrado para eliminar.");
        }
    }
}