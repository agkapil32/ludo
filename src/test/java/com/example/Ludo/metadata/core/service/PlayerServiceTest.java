package com.example.Ludo.metadata.core.service;

import static org.junit.jupiter.api.Assertions.*;

import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.core.model.Player;
import com.example.Ludo.metadata.exception.InvalidActionException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PlayerServiceTest {
  private PlayerService playerService;
  private GameState gameState;

  @BeforeEach
  void setUp() {
    playerService = new PlayerService();
    List<Player> players = new ArrayList<>();
    players.add(new Player("id1", "Alice", "GREEN"));
    gameState =
        new GameState(
            "test",
            false,
            false,
            null,
            0,
            players,
            new ArrayList<>(),
            new HashMap<>(),
            new ArrayList<>());
  }

  @Test
  void testAddPlayer_Success() {
    playerService.addPlayer(gameState, "Bob");
    assertEquals(2, gameState.getPlayers().size());
    assertEquals("Bob", gameState.getPlayers().get(1).getName());
  }

  @Test
  void testAddPlayer_DuplicateName() {
    playerService.addPlayer(gameState, "Alice");
    assertEquals(2, gameState.getPlayers().size());
  }

  @Test
  void testAddPlayer_MaxPlayers() {
    playerService.addPlayer(gameState, "Bob");
    playerService.addPlayer(gameState, "John");
    playerService.addPlayer(gameState, "Kapil");
    // Try to add fifth player
    assertThrows(InvalidActionException.class, () -> playerService.addPlayer(gameState, "Extra"));
  }

  @Test
  void testAddPlayer_EmptyName() {
    assertThrows(InvalidActionException.class, () -> playerService.addPlayer(gameState, ""));
  }
}
