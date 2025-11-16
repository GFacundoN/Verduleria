package com.verduleria.app_verduleria.entitys;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "remitos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Remito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El número de remito es obligatorio")
    private Long numeroRemito;

    @OneToOne
    @JoinColumn(name = "pedido_id", unique = true, nullable = false)
    @NotNull(message = "El remito debe estar asociado a un pedido")
    private Pedido pedido;

    @NotNull(message = "El valor total es obligatorio")
    @DecimalMin(value = "0.00", message = "El valor total no puede ser negativo")
    private BigDecimal valorTotal;

    @NotNull(message = "La fecha de emisión es obligatoria")
    private LocalDateTime fechaEmision = LocalDateTime.now();
}
