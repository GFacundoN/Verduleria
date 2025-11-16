package com.verduleria.app_verduleria;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class AppVerduleriaApplication extends Application {
    private ConfigurableApplicationContext springContext;


    public static void main(String[] args) {
        Application.launch(args);
    }


    @Override
    public void init() throws Exception {
        springContext = new SpringApplicationBuilder(AppVerduleriaApplication.class).run();
    }


    @Override
    public void start(Stage stage) throws Exception {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/fxml/main.fxml"));
        loader.setControllerFactory(springContext::getBean);


        Scene scene = new Scene(loader.load());
        scene.getStylesheets().add(getClass().getResource("/fxml/main.css").toExternalForm());


        stage.setTitle("Verdulería — Administración");
        stage.setScene(scene);
        stage.setMinWidth(900);
        stage.setMinHeight(600);
        stage.show();
    }


    @Override
    public void stop() throws Exception {
        springContext.close();
        Platform.exit();
    }
}