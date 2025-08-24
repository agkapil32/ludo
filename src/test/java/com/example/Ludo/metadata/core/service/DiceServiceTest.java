package com.example.Ludo.metadata.core.service;

import static org.junit.jupiter.api.Assertions.*;

import com.example.Ludo.metadata.core.model.Dice;
import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.exception.InvalidActionException;
import java.util.ArrayList;
import java.util.HashMap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DiceServiceTest {
  private DiceService diceService;

  @BeforeEach
  void setUp() {
    diceService = new DiceService();
  }

  @Test
  void testRollDice_GameEnded_ThrowsException() {
    GameState game =
        new GameState(
            "test",
            true,
            true,
            "player1",
            0,
            new ArrayList<>(),
            new ArrayList<>(),
            new HashMap<>(),
            new ArrayList<>());
    assertThrows(InvalidActionException.class, () -> diceService.rollDice(game, 0));
  }

  @Test
  void testRollDice_NotPlayersTurn_ThrowsException() {
    GameState game =
        new GameState(
            "test",
            false,
            false,
            "player1",
            0,
            new ArrayList<>(),
            new ArrayList<>(),
            new HashMap<>(),
            new ArrayList<>());
    assertThrows(InvalidActionException.class, () -> diceService.rollDice(game, 1));
  }

  @Test
  void testRollDice_ValidRoll() {
    GameState game =
        new GameState(
            "test",
            false,
            false,
            "player1",
            0,
            new ArrayList<>(),
            new ArrayList<>(),
            new HashMap<>(),
            new ArrayList<>());
    Dice dice = diceService.rollDice(game, 0);
    assertNotNull(dice);
    assertTrue(dice.getMove() >= 1 && dice.getMove() <= 6);
    assertFalse(dice.isUsed());
    assertEquals(1, game.getCurrentDiceRolls().size());
  }

  @Test
  void testRollDice_MultipleRolls() {
    GameState game =
        new GameState(
            "test",
            false,
            false,
            "player1",
            0,
            new ArrayList<>(),
            new ArrayList<>(),
            new HashMap<>(),
            new ArrayList<>());
    diceService.rollDice(game, 0);
    diceService.rollDice(game, 0);
    assertEquals(2, game.getCurrentDiceRolls().size());
  }
}
