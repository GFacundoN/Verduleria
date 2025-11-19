package com.verduleria.app_verduleria.services;

import com.verduleria.app_verduleria.dtos.DetallePedidoDto;
import com.verduleria.app_verduleria.entitys.DetallePedido;
import com.verduleria.app_verduleria.entitys.Pedido;
import com.verduleria.app_verduleria.entitys.Producto;
import com.verduleria.app_verduleria.repositorys.DetallePedidoRepository;
import com.verduleria.app_verduleria.repositorys.PedidoRepository;
import com.verduleria.app_verduleria.repositorys.ProductoRepository;
import com.verduleria.app_verduleria.specifications.GenericSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DetallePedidoService {

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;
    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public List<DetallePedidoDto> findAll() {
        return detallePedidoRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DetallePedidoDto> findByCriteria(String search) {
        return detallePedidoRepository.findAll(new GenericSpecification<>(search)).stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DetallePedidoDto findById(Long id) {
        return detallePedidoRepository.findById(id).map(this::convertToDto).orElseThrow(() -> new RuntimeException("Detalle de pedido no encontrado"));
    }

    @Transactional
    public DetallePedidoDto save(DetallePedidoDto detallePedidoDto) {
        DetallePedido detallePedido = convertToEntity(detallePedidoDto);
        return convertToDto(detallePedidoRepository.save(detallePedido));
    }

    @Transactional
    public DetallePedidoDto update(Long id, DetallePedidoDto detallePedidoDto) {
        DetallePedido detalle = detallePedidoRepository.findById(id).orElseThrow(() -> new RuntimeException("Detalle de pedido no encontrado"));
        detalle.setCantidad(detallePedidoDto.getCantidad());
        detalle.setPrecioVenta(detallePedidoDto.getPrecioVenta());
        // For simplicity, we are not updating product or order here.
        return convertToDto(detallePedidoRepository.save(detalle));
    }

    @Transactional
    public void deleteById(Long id) {
        if (!detallePedidoRepository.existsById(id)) {
            throw new RuntimeException("Detalle de pedido con ID " + id + " no encontrado para eliminar.");
        }
        detallePedidoRepository.deleteById(id);
    }

    private DetallePedidoDto convertToDto(DetallePedido detalle) {
        return new DetallePedidoDto(
                detalle.getId(),
                detalle.getPedido().getId(),
                detalle.getProducto().getId(),
                detalle.getCantidad(),
                detalle.getPrecioVenta(),
                detalle.getSubtotal()
        );
    }

    private DetallePedido convertToEntity(DetallePedidoDto dto) {
        DetallePedido detalle = new DetallePedido();
        Pedido pedido = pedidoRepository.findById(dto.getPedidoId()).orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        Producto producto = productoRepository.findById(dto.getProductoId()).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        detalle.setId(dto.getId());
        detalle.setPedido(pedido);
        detalle.setProducto(producto);
        detalle.setCantidad(dto.getCantidad());
        detalle.setPrecioVenta(dto.getPrecioVenta());
        return detalle;
    }
}
