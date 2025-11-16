package com.verduleria.app_verduleria.services;

import com.verduleria.app_verduleria.entitys.Pedido;
import com.verduleria.app_verduleria.entitys.Pedido.EstadoPedido;
import com.verduleria.app_verduleria.entitys.Cliente;
import com.verduleria.app_verduleria.repositorys.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ClienteService clienteService;

    @Transactional
    public Pedido guardarOActualizar(Pedido pedido) {

        if (pedido.getCliente() == null || pedido.getCliente().getId() == null) {

            throw new IllegalArgumentException("El pedido debe estar asociado a un cliente válido.");
        }

        Optional<Cliente> cliente = clienteService.buscarPorId(pedido.getCliente().getId());
        if (cliente.isEmpty()) {

            throw new RuntimeException("No se pudo encontrar el cliente con ID: " + pedido.getCliente().getId());
        }

        pedido.setCliente(cliente.get());

        if (pedido.getDetalles() != null) {
            pedido.getDetalles().forEach(detalle -> detalle.setPedido(pedido));

            BigDecimal totalCalculado = pedido.getDetalles().stream()
                    .map(detalle -> detalle.getCantidad().multiply(detalle.getPrecioVenta()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .setScale(2, RoundingMode.HALF_UP);

            pedido.setMontoTotal(totalCalculado);
        }

        return pedidoRepository.save(pedido);
    }

    @Transactional(readOnly = true)
    public List<Pedido> buscarTodos() {

        return pedidoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Pedido> buscarPorId(Long id) {

        return pedidoRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Pedido> buscarPorClienteId(Long clienteId) {

        return pedidoRepository.findByClienteId(clienteId);
    }

    @Transactional(readOnly = true)
    public List<Pedido> buscarPorEstado(EstadoPedido estado) {

        return pedidoRepository.findByEstado(estado);
    }

    @Transactional
    public Pedido cambiarEstado(Long id, EstadoPedido nuevoEstado) {

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido con ID " + id + " no encontrado."));

        pedido.setEstado(nuevoEstado);

        if (nuevoEstado == EstadoPedido.ENTREGADO) {

            pedido.setRemitoGenerado(true);
        }

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public void eliminarPorId(Long id) {
        if (pedidoRepository.existsById(id)) {

            pedidoRepository.deleteById(id);
        } else {

            throw new RuntimeException("Pedido con ID " + id + " no encontrado para eliminar.");
        }
    }
}