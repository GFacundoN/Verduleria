package com.verduleria.app_verduleria.services;

import com.verduleria.app_verduleria.dtos.ClienteDto;
import com.verduleria.app_verduleria.entitys.Cliente;
import com.verduleria.app_verduleria.repositorys.ClienteRepository;
import com.verduleria.app_verduleria.specifications.GenericSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public List<ClienteDto> findAll() {
        return clienteRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClienteDto> findByCriteria(String search) {
        return clienteRepository.findAll(new GenericSpecification<>(search)).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClienteDto findById(Long id) {
        return clienteRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @Transactional
    public ClienteDto save(ClienteDto clienteDto) {
        Cliente cliente = convertToEntity(clienteDto);
        return convertToDto(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteDto update(Long id, ClienteDto clienteDto) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        cliente.setRazonSocial(clienteDto.getRazonSocial());
        cliente.setTelefono(clienteDto.getTelefono());
        cliente.setDireccion(clienteDto.getDireccion());
        cliente.setEmail(clienteDto.getEmail());
        cliente.setCuitDni(clienteDto.getCuitDni());
        return convertToDto(clienteRepository.save(cliente));
    }

    @Transactional
    public void deleteById(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RuntimeException("Cliente con ID " + id + " no encontrado para eliminar.");
        }
        clienteRepository.deleteById(id);
    }

    private ClienteDto convertToDto(Cliente cliente) {
        return new ClienteDto(
                cliente.getId(),
                cliente.getRazonSocial(),
                cliente.getTelefono(),
                cliente.getDireccion(),
                cliente.getEmail(),
                cliente.getCuitDni()
        );
    }

    private Cliente convertToEntity(ClienteDto dto) {
        Cliente cliente = new Cliente();
        cliente.setId(dto.getId());
        cliente.setRazonSocial(dto.getRazonSocial());
        cliente.setTelefono(dto.getTelefono());
        cliente.setDireccion(dto.getDireccion());
        cliente.setEmail(dto.getEmail());
        cliente.setCuitDni(dto.getCuitDni());
        return cliente;
    }
}