package com.verduleria.app_verduleria.repositorys;

import com.verduleria.app_verduleria.entitys.Remito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RemitoRepository extends JpaRepository<Remito, Long>, JpaSpecificationExecutor<Remito> {

    Optional<Remito> findByPedidoId(Long pedidoId);
}