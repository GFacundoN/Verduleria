package com.verduleria.app_verduleria.controllers;

import javafx.fxml.FXML;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import org.springframework.stereotype.Component;

@Component
public class MainController {

    @FXML private ImageView appIcon;

    @FXML
    public void initialize() {

    }

    @FXML
    private void openClientes() {
        System.out.println("Navegar -> Clientes");
        // reemplazar con llamada a FXMLLoader para abrir la vista Clientes
    }

    @FXML
    private void openProductos() {
        System.out.println("Navegar -> Productos");
    }

    @FXML
    private void openPedidos() {
        System.out.println("Navegar -> Pedidos");
    }

    @FXML
    private void openDetallePedidos() {
        System.out.println("Navegar -> Detalle Pedidos");
    }

    @FXML
    private void openRemito() {
        System.out.println("Navegar -> Remito");
    }
}
