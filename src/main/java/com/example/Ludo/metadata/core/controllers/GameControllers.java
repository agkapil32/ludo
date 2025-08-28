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
    System.out.println("🎮 Create game request");
    try {
      GameStateDTO result = gameService.createGame();
      System.out.println("✅ Game created: " + result.getGameId());
      return ResponseEntity.ok().body(result);
    } catch (Exception e) {
      System.out.println("❌ Create game failed: " + e.getMessage());
      throw e;
    }
  }

  @PostMapping("/addPlayer")
  ResponseEntity<GameStateDTO> addPlayer(
      @RequestParam String gameId, @RequestParam String playerName) {
    System.out.println("👤 Add player: " + playerName);
    try {
      GameStateDTO result = gameService.addPlayer(gameId, playerName);
      System.out.println("✅ Player added - total: " + result.getPlayers().size());
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      System.out.println("❌ Add player failed: " + e.getMessage());
      throw e;
    }
  }

  @PostMapping("/startGame")
  ResponseEntity<GameStateDTO> startGame(@RequestParam String gameId) {
    System.out.println("🚀 Start game: " + gameId);
    try {
      GameStateDTO result = gameService.startGame(gameId);
      System.out.println("✅ Game started");
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      System.out.println("❌ Start game failed: " + e.getMessage());
      throw e;
    }
  }

  @PostMapping("/rollDice/playerIndex")
  ResponseEntity<GameStateDTO> rollDice(
      @RequestParam String gameId, @RequestParam Integer playerIndex) {
    try {
      GameStateDTO result = gameService.rollTheDice(gameId, playerIndex);
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      System.out.println("❌ Roll dice failed: " + e.getMessage());
      throw e;
    }
  }

  @PostMapping("/moveToken/playerIndex")
  ResponseEntity<GameStateDTO> moveToken(
      @RequestParam String gameId,
      @RequestParam Integer playerIndex,
      @RequestParam Integer tokenIndex) {
    try {
      GameStateDTO result = gameService.moveTheToken(gameId, playerIndex, tokenIndex);
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      System.out.println("❌ Move token failed: " + e.getMessage());
      throw e;
    }
  }

  @GetMapping("/getGameState")
  ResponseEntity<GameStateDTO> getGameState(@RequestParam String gameId) {
    try {
      GameStateDTO result = gameService.getGameState(gameId);
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      System.out.println("❌ Get game state failed: " + e.getMessage());
      throw e;
    }
  }
}
