package com.verduleria.app_verduleria.services;

import com.verduleria.app_verduleria.entitys.DetallePedido;
import com.verduleria.app_verduleria.repositorys.DetallePedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class DetallePedidoService {

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Transactional
    public DetallePedido guardarOActualizar(DetallePedido detalle) {

        return detallePedidoRepository.save(detalle);
    }

    @Transactional(readOnly = true)
    public List<DetallePedido> buscarTodos() {

        return detallePedidoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<DetallePedido> buscarPorId(Long id) {

        return detallePedidoRepository.findById(id);
    }

    @Transactional
    public void eliminarPorId(Long id) {

        if (detallePedidoRepository.existsById(id)) {

            detallePedidoRepository.deleteById(id);
        } else {

            throw new RuntimeException("Detalle de Pedido con ID " + id + " no encontrado para eliminar.");
        }
    }
}