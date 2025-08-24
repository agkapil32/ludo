package com.example.Ludo.metadata.core.service;

import static org.junit.jupiter.api.Assertions.*;

import com.example.Ludo.metadata.core.constants.ApplicationConstants;
import com.example.Ludo.metadata.core.enums.Color;
import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.core.model.Token;
import com.example.Ludo.metadata.exception.InvalidActionException;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TokenServiceTest {
  private TokenService tokenService;
  private GameState gameState;

  @BeforeEach
  void setUp() {
    tokenService = new TokenService();
    List<Token> tokens = new ArrayList<>();
    tokens.add(new Token(0, -1, Color.GREEN));
    tokens.add(new Token(1, 1, Color.GREEN));
    tokens.add(new Token(2, ApplicationConstants.endPosition, Color.GREEN));
    Map<Integer, List<Token>> playerPositions = new HashMap<>();
    playerPositions.put(0, tokens);
    gameState =
        new GameState(
            "test",
            true,
            false,
            "player1",
            0,
            new ArrayList<>(),
            new ArrayList<>(),
            playerPositions,
            new ArrayList<>());
  }

  @Test
  void testMoveToken_TokenNotFound() {
    assertThrows(InvalidActionException.class, () -> tokenService.moveToken(gameState, 0, 99, 1));
  }

  @Test
  void testMoveToken_MoveValueNegative() {
    assertThrows(InvalidActionException.class, () -> tokenService.moveToken(gameState, 0, 0, -1));
  }

  @Test
  void testMoveToken_FinishedToken() {
    assertThrows(InvalidActionException.class, () -> tokenService.moveToken(gameState, 0, 2, 1));
  }

  @Test
  void testMoveToken_ExceedsEndPosition() {
    Token token = new Token(1, ApplicationConstants.endPosition - 1, Color.GREEN);
    gameState.getPlayerPositions().get(0).set(1, token);
    assertThrows(InvalidActionException.class, () -> tokenService.moveToken(gameState, 0, 1, 2));
  }

  @Test
  void testMoveToken_OpenTokenValidMove() {
    Token token = new Token(1, 1, Color.GREEN);
    gameState.getPlayerPositions().get(0).set(1, token);
    Token moved = tokenService.moveToken(gameState, 0, 1, 2);
    assertEquals(3, moved.getCurrentPosition());
  }

  @Test
  void testMoveToken_UnlockTokenWithSix() {
    Token token = new Token(0, -1, Color.GREEN);
    gameState.getPlayerPositions().get(0).set(0, token);
    Token moved = tokenService.moveToken(gameState, 0, 0, 6);
    assertEquals(1, moved.getCurrentPosition());
  }

  @Test
  void testMoveToken_CannotUnlockWithNonSix() {
    Token token = new Token(0, -1, Color.GREEN);
    gameState.getPlayerPositions().get(0).set(0, token);
    assertThrows(InvalidActionException.class, () -> tokenService.moveToken(gameState, 0, 0, 5));
    assertEquals(-1, gameState.getPlayerPositions().get(0).get(0).getCurrentPosition());
  }
}
