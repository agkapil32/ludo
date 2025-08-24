package com.example.Ludo.metadata.core.controllers;

import com.example.Ludo.metadata.core.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestControllers {

  @Autowired private GameService gameService;

  @GetMapping("/test/addGameState")
  public String addTestGameState() {
    gameService.addTestGameState();
    return "Test GameState added.";
  }

  @GetMapping("/hello")
  private String helloworld() {
    return "Hello World!";
  }
}
