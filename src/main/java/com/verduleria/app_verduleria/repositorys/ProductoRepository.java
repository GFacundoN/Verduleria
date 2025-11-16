package com.verduleria.app_verduleria.repositorys;

import com.verduleria.app_verduleria.entitys.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {}