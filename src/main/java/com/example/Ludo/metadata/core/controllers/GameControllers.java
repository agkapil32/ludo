package com.example.Ludo.metadata.core.controllers;

import com.example.Ludo.metadata.core.dto.GameStateDTO;
import com.example.Ludo.metadata.core.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("ludo/backend/v1")
@RequiredArgsConstructor
public class GameControllers {

  private final GameService gameService;

  @GetMapping("/createGame")
  ResponseEntity<GameStateDTO> createGame() {
    System.out.println("A New Game is created");
    return ResponseEntity.ok().body(gameService.createGame());
  }

  @PostMapping("/addPlayer")
  ResponseEntity<GameStateDTO> addPlayer(
      @RequestParam String gameId, @RequestParam String playerName) {
    return ResponseEntity.ok(gameService.addPlayer(gameId, playerName));
  }

  @PostMapping("/startGame")
  ResponseEntity<GameStateDTO> startGame(@RequestParam String gameId) {
    return ResponseEntity.ok(gameService.startGame(gameId));
  }

  @PostMapping("/rollDice/playerIndex")
  ResponseEntity<GameStateDTO> rollDice(
      @RequestParam String gameId, @RequestParam Integer playerIndex) {
    return ResponseEntity.ok(gameService.rollTheDice(gameId, playerIndex));
  }

  @PostMapping("/moveToken/playerIndex")
  ResponseEntity<GameStateDTO> moveToken(
      @RequestParam String gameId,
      @RequestParam Integer playerIndex,  // Changed from String to Integer
      @RequestParam Integer tokenIndex) {
    return ResponseEntity.ok(gameService.moveTheToken(gameId, playerIndex, tokenIndex));  // Pass playerIndex instead of playerId
  }

  @GetMapping("/getGameState")
  ResponseEntity<GameStateDTO> getGameState(@RequestParam String gameId) {
    return ResponseEntity.ok(gameService.getGameState(gameId));
  }
}
