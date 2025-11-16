package com.verduleria.app_verduleria.repositorys;

import com.verduleria.app_verduleria.entitys.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {}