package com.verduleria.app_verduleria.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClienteDto {

    private Long id;

    @NotBlank(message = "El nombre/razón social es obligatorio")
    private String razonSocial;

    private String telefono;

    @NotBlank(message = "La dirección de entrega es obligatoria")
    private String direccion;

    @Email(message = "Debe ser un formato de correo electrónico válido")
    private String email;

    @NotBlank(message = "El cuit/dni es obligatorio")
    private String cuitDni;
}