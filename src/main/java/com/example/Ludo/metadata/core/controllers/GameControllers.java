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
    System.out.println("🎮 [GameController] Create game request");
    try {
      GameStateDTO result = gameService.createGame();
      System.out.println("✅ [GameController] Game created: " + result.getGameId());
      return ResponseEntity.ok().body(result);
    } catch (Exception e) {
      System.out.println("❌ [GameController] Create game failed: " + e.getMessage());
      throw e;
    }
  }

  @PostMapping("/addPlayer")
  ResponseEntity<GameStateDTO> addPlayer(
      @RequestParam String gameId, @RequestParam String playerName) {
    System.out.println("👤 [GameController] Add player: " + playerName + " to " + gameId);
    try {
      GameStateDTO result = gameService.addPlayer(gameId, playerName);
      System.out.println("✅ [GameController] Player added - total: " + result.getPlayers().size());
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      System.out.println("❌ [GameController] Add player failed: " + e.getMessage());
      throw e;
    }
  }

  @PostMapping("/startGame")
  ResponseEntity<GameStateDTO> startGame(@RequestParam String gameId) {
    System.out.println("🚀 [GameController] Start game: " + gameId);
    try {
      GameStateDTO result = gameService.startGame(gameId);
      System.out.println("✅ [GameController] Game started - current player: " + result.getCurrentPlayerIndex());
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      System.out.println("❌ [GameController] Start game failed: " + e.getMessage());
      throw e;
    }
  }

  @PostMapping("/rollDice/playerIndex")
  ResponseEntity<GameStateDTO> rollDice(
      @RequestParam String gameId, @RequestParam Integer playerIndex) {
    System.out.println("🎲 [GameController] Roll dice - Game: " + gameId + ", Player: " + playerIndex);
    try {
      GameStateDTO result = gameService.rollTheDice(gameId, playerIndex);
      System.out.println("✅ [GameController] Dice rolled - results: " + result.getCurrentDiceRolls().size());
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      System.out.println("❌ [GameController] Roll dice failed: " + e.getMessage());
      throw e;
    }
  }

  @PostMapping("/moveToken/playerIndex")
  ResponseEntity<GameStateDTO> moveToken(
      @RequestParam String gameId,
      @RequestParam Integer playerIndex,
      @RequestParam Integer tokenIndex) {
    System.out.println("🚀 [GameController] Move token - Game: " + gameId + ", Player: " + playerIndex + ", Token: " + tokenIndex);
    try {
      GameStateDTO result = gameService.moveTheToken(gameId, playerIndex, tokenIndex);
      System.out.println("✅ [GameController] Token moved - current player: " + result.getCurrentPlayerIndex());
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      System.out.println("❌ [GameController] Move token failed: " + e.getMessage());
      throw e;
    }
  }

  @GetMapping("/getGameState")
  ResponseEntity<GameStateDTO> getGameState(@RequestParam String gameId) {
    // No logging for frequent getGameState calls to reduce noise
    try {
      GameStateDTO result = gameService.getGameState(gameId);
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      System.out.println("❌ [GameController] Get game state failed: " + e.getMessage());
      throw e;
    }
  }
}
