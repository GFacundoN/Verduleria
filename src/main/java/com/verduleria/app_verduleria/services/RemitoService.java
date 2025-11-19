package com.verduleria.app_verduleria.services;

import com.verduleria.app_verduleria.dtos.RemitoDto;
import com.verduleria.app_verduleria.entitys.Pedido;
import com.verduleria.app_verduleria.entitys.Remito;
import com.verduleria.app_verduleria.repositorys.PedidoRepository;
import com.verduleria.app_verduleria.repositorys.RemitoRepository;
import com.verduleria.app_verduleria.specifications.GenericSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RemitoService {

    @Autowired
    private RemitoRepository remitoRepository;
    @Autowired
    private PedidoRepository pedidoRepository;

    @Transactional(readOnly = true)
    public List<RemitoDto> findAll() {
        return remitoRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<RemitoDto> findByCriteria(String search) {
        return remitoRepository.findAll(new GenericSpecification<>(search)).stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RemitoDto findById(Long id) {
        return remitoRepository.findById(id).map(this::convertToDto).orElseThrow(() -> new RuntimeException("Remito no encontrado"));
    }

    @Transactional
    public RemitoDto save(RemitoDto remitoDto) {
        Remito remito = convertToEntity(remitoDto);
        return convertToDto(remitoRepository.save(remito));
    }

    @Transactional
    public RemitoDto update(Long id, RemitoDto remitoDto) {
        Remito remito = remitoRepository.findById(id).orElseThrow(() -> new RuntimeException("Remito no encontrado"));
        remito.setNumeroRemito(remitoDto.getNumeroRemito());
        remito.setValorTotal(remitoDto.getValorTotal());
        remito.setFechaEmision(remitoDto.getFechaEmision());
        // For simplicity, we are not updating the order here.
        return convertToDto(remitoRepository.save(remito));
    }

    @Transactional
    public void deleteById(Long id) {
        if (!remitoRepository.existsById(id)) {
            throw new RuntimeException("Remito con ID " + id + " no encontrado para eliminar.");
        }
        remitoRepository.deleteById(id);
    }

    private RemitoDto convertToDto(Remito remito) {
        return new RemitoDto(
                remito.getId(),
                remito.getNumeroRemito(),
                remito.getPedido().getId(),
                remito.getValorTotal(),
                remito.getFechaEmision()
        );
    }

    private Remito convertToEntity(RemitoDto dto) {
        Remito remito = new Remito();
        Pedido pedido = pedidoRepository.findById(dto.getPedidoId()).orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        remito.setId(dto.getId());
        remito.setNumeroRemito(dto.getNumeroRemito());
        remito.setPedido(pedido);
        remito.setValorTotal(dto.getValorTotal());
        remito.setFechaEmision(dto.getFechaEmision());
        return remito;
    }
}
