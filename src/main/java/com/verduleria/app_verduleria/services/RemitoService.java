package com.verduleria.app_verduleria.services;

import com.verduleria.app_verduleria.entitys.Pedido;
import com.verduleria.app_verduleria.entitys.Pedido.EstadoPedido;
import com.verduleria.app_verduleria.entitys.Remito;
import com.verduleria.app_verduleria.entitys.DetallePedido;
import com.verduleria.app_verduleria.repositorys.RemitoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
public class RemitoService {

    @Autowired
    private RemitoRepository remitoRepository;

    @Autowired
    private PedidoService pedidoService;

    @Transactional
    public Remito generarRemito(Long pedidoId, Long numeroRemito) {

        if (remitoRepository.findByPedidoId(pedidoId).isPresent()) {

            throw new RuntimeException("El pedido ID " + pedidoId + " ya tiene un remito asociado.");
        }

        Pedido pedido = pedidoService.buscarPorId(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido con ID " + pedidoId + " no encontrado."));

        if (pedido.getEstado() != EstadoPedido.EN_PREPARACION && pedido.getEstado() != EstadoPedido.ENVIADO) {

            throw new IllegalStateException("El remito solo puede generarse para pedidos en estado EN_PREPARACION o ENVIADO.");
        }

        BigDecimal valorTotal = pedido.getDetalles().stream()
                .map(DetallePedido::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        Remito nuevoRemito = new Remito();
        nuevoRemito.setPedido(pedido);
        nuevoRemito.setFechaEmision(LocalDateTime.now());
        nuevoRemito.setNumeroRemito(numeroRemito);
        nuevoRemito.setValorTotal(valorTotal);

        Remito remitoPersistido = remitoRepository.save(nuevoRemito);

        if (pedido.getEstado() == EstadoPedido.EN_PREPARACION) {

            pedidoService.cambiarEstado(pedidoId, EstadoPedido.ENVIADO);
        }

        return remitoPersistido;
    }

    @Transactional(readOnly = true)
    public Optional<Remito> buscarPorPedidoId(Long pedidoId) {

        return remitoRepository.findByPedidoId(pedidoId);
    }

    @Transactional
    public Remito confirmarEntrega(Long remitoId, String personaQueRecibe, String dniPersonaQueRecibe, String observaciones) {

        Remito remito = remitoRepository.findById(remitoId)
                .orElseThrow(() -> new RuntimeException("Remito con ID " + remitoId + " no encontrado."));

        if (remito.getPedido().getEstado() != EstadoPedido.ENTREGADO) {

            pedidoService.cambiarEstado(remito.getPedido().getId(), EstadoPedido.ENTREGADO);
        }

        return remitoRepository.save(remito);
    }

    @Transactional(readOnly = true)
    public List<Remito> buscarTodos() {

        return remitoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Remito> buscarPorId(Long id) {

        return remitoRepository.findById(id);
    }

    @Transactional
    public void eliminarPorId(Long id) {

        if (remitoRepository.existsById(id)) {

            remitoRepository.deleteById(id);
        } else {

            throw new RuntimeException("Remito con ID " + id + " no encontrado para eliminar.");
        }
    }
}