package com.verduleria.app_verduleria.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RemitoDto {

    private Long id;

    @NotNull(message = "El número de remito es obligatorio")
    private Long numeroRemito;

    @NotNull(message = "El ID del pedido es obligatorio")
    private Long pedidoId;

    @NotNull(message = "El valor total es obligatorio")
    @DecimalMin(value = "0.00", message = "El valor total no puede ser negativo")
    private BigDecimal valorTotal;

    @NotNull(message = "La fecha de emisión es obligatoria")
    private LocalDateTime fechaEmision = LocalDateTime.now();
}
