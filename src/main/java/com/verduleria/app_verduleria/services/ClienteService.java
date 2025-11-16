package com.verduleria.app_verduleria.services;

import com.verduleria.app_verduleria.entitys.Cliente;
import com.verduleria.app_verduleria.repositorys.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional
    public Cliente guardarOActualizar(Cliente cliente) {

        return clienteRepository.save(cliente);
    }

    @Transactional(readOnly = true)
    public List<Cliente> buscarTodos() {

        return clienteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Cliente> buscarPorId(Long id) {

        return clienteRepository.findById(id);
    }

    @Transactional
    public void eliminarPorId(Long id) {

        if (clienteRepository.existsById(id)) {

            clienteRepository.deleteById(id);
        } else {
            throw new RuntimeException("Cliente con ID " + id + " no encontrado para eliminar.");
        }
    }
}