package com.verduleria.app_verduleria.dtos;

import com.verduleria.app_verduleria.entitys.Pedido;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoDto {

    private Long id;

    @NotNull(message = "La fecha de creación es obligatoria")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @NotNull(message = "El ID del cliente es obligatorio")
    private Long clienteId;

    private Pedido.EstadoPedido estado = Pedido.EstadoPedido.PENDIENTE;

    private Boolean remitoGenerado = false;

    private List<DetallePedidoDto> detalles;

    @NotNull(message = "El monto total es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto total debe ser positivo")
    private BigDecimal montoTotal;
}
