package com.verduleria.app_verduleria.services;

import com.verduleria.app_verduleria.dtos.DetallePedidoDto;
import com.verduleria.app_verduleria.dtos.PedidoDto;
import com.verduleria.app_verduleria.entitys.Cliente;
import com.verduleria.app_verduleria.entitys.DetallePedido;
import com.verduleria.app_verduleria.entitys.Pedido;
import com.verduleria.app_verduleria.entitys.Producto;
import com.verduleria.app_verduleria.repositorys.ClienteRepository;
import com.verduleria.app_verduleria.repositorys.PedidoRepository;
import com.verduleria.app_verduleria.repositorys.ProductoRepository;
import com.verduleria.app_verduleria.specifications.GenericSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public List<PedidoDto> findAll() {
        return pedidoRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PedidoDto> findByCriteria(String search) {
        return pedidoRepository.findAll(new GenericSpecification<>(search)).stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PedidoDto findById(Long id) {
        return pedidoRepository.findById(id).map(this::convertToDto).orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    }

    @Transactional
    public PedidoDto save(PedidoDto pedidoDto) {
        Pedido pedido = convertToEntity(pedidoDto);
        return convertToDto(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoDto update(Long id, PedidoDto pedidoDto) {
        Pedido pedido = pedidoRepository.findById(id).orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        // Update fields
        pedido.setEstado(pedidoDto.getEstado());
        pedido.setRemitoGenerado(pedidoDto.getRemitoGenerado());
        pedido.setMontoTotal(pedidoDto.getMontoTotal());
        // For simplicity, we are not updating client or details here. A more complex logic would be needed.
        return convertToDto(pedidoRepository.save(pedido));
    }

    @Transactional
    public void deleteById(Long id) {
        if (!pedidoRepository.existsById(id)) {
            throw new RuntimeException("Pedido con ID " + id + " no encontrado para eliminar.");
        }
        pedidoRepository.deleteById(id);
    }

    private PedidoDto convertToDto(Pedido pedido) {
        List<DetallePedidoDto> detalleDtos = pedido.getDetalles().stream().map(this::convertDetalleToDto).collect(Collectors.toList());
        return new PedidoDto(
                pedido.getId(),
                pedido.getFechaCreacion(),
                pedido.getCliente().getId(),
                pedido.getEstado(),
                pedido.getRemitoGenerado(),
                detalleDtos,
                pedido.getMontoTotal()
        );
    }

    private Pedido convertToEntity(PedidoDto dto) {
        Pedido pedido = new Pedido();
        Cliente cliente = clienteRepository.findById(dto.getClienteId()).orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        pedido.setId(dto.getId());
        pedido.setFechaCreacion(dto.getFechaCreacion());
        pedido.setCliente(cliente);
        pedido.setEstado(dto.getEstado());
        pedido.setRemitoGenerado(dto.getRemitoGenerado());
        pedido.setMontoTotal(dto.getMontoTotal());

        if (dto.getDetalles() != null) {
            List<DetallePedido> detalles = dto.getDetalles().stream().map(d -> convertDetalleToEntity(d, pedido)).collect(Collectors.toList());
            pedido.setDetalles(detalles);
        }

        return pedido;
    }

    private DetallePedidoDto convertDetalleToDto(DetallePedido detalle) {
        return new DetallePedidoDto(
                detalle.getId(),
                detalle.getPedido().getId(),
                detalle.getProducto().getId(),
                detalle.getCantidad(),
                detalle.getPrecioVenta(),
                detalle.getSubtotal()
        );
    }

    private DetallePedido convertDetalleToEntity(DetallePedidoDto dto, Pedido pedido) {
        DetallePedido detalle = new DetallePedido();
        Producto producto = productoRepository.findById(dto.getProductoId()).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        detalle.setId(dto.getId());
        detalle.setPedido(pedido);
        detalle.setProducto(producto);
        detalle.setCantidad(dto.getCantidad());
        detalle.setPrecioVenta(dto.getPrecioVenta());
        return detalle;
    }
}
