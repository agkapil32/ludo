package com.example.Ludo.metadata.core.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.Ludo.metadata.core.dto.GameStateDTO;
import com.example.Ludo.metadata.core.enums.Color;
import com.example.Ludo.metadata.core.model.Dice;
import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.core.model.Player;
import com.example.Ludo.metadata.core.model.Token;
import com.example.Ludo.metadata.exception.GameNotFoundException;
import com.example.Ludo.metadata.exception.InvalidActionException;
import java.lang.reflect.Field;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class GameServiceTest {
  @InjectMocks private GameService gameService;
  @Mock private LudoRule ludoRule;
  @Mock private PlayerService playerService;
  @Mock private DiceService diceService;
  @Mock private TokenService tokenService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void testCreateGame() {
    GameStateDTO dto = gameService.createGame();
    assertNotNull(dto.getGameId());
    assertFalse(dto.isStarted());
  }

  @Test
  void testAddPlayer_GameNotFound() {
    assertThrows(GameNotFoundException.class, () -> gameService.addPlayer("invalid", "Alice"));
  }

  // Utility method to set private 'games' field using reflection
  private void setGame(String gameId, GameState game) {
    try {
      Field gamesField = GameService.class.getDeclaredField("games");
      gamesField.setAccessible(true);
      Map<String, GameState> gamesMap = (Map<String, GameState>) gamesField.get(gameService);
      gamesMap.put(gameId, game);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  @Test
  void testAddPlayer_GameStarted() {
    GameState game = mock(GameState.class);
    when(game.isStarted()).thenReturn(true);
    setGame("test", game);
    assertThrows(InvalidActionException.class, () -> gameService.addPlayer("test", "Bob"));
  }

  @Test
  void testStartGame_NotEnoughPlayers() {
    GameState game =
        new GameState(
            "test",
            false,
            false,
            null,
            0,
            new ArrayList<>(),
            new ArrayList<>(),
            new HashMap<>(),
            new ArrayList<>());
    setGame("test", game);
    assertThrows(InvalidActionException.class, () -> gameService.startGame("test"));
  }

  @Test
  void testRollDice_GameNotStarted() {
    GameState game =
        new GameState(
            "test",
            false,
            false,
            null,
            0,
            new ArrayList<>(),
            new ArrayList<>(),
            new HashMap<>(),
            new ArrayList<>());
    setGame("test", game);
    assertThrows(InvalidActionException.class, () -> gameService.rollTheDice("test", 0));
  }

  @Test
  void testMoveToken_GameNotFound() {
    assertThrows(
        GameNotFoundException.class, () -> gameService.moveTheToken("invalid", "player", 0));
  }

  @Test
  void testMoveToken_GameNotStarted() {
    GameState game =
        new GameState(
            "test",
            false,
            false,
            null,
            0,
            new ArrayList<>(),
            new ArrayList<>(),
            new HashMap<>(),
            new ArrayList<>());
    setGame("test", game);
    assertThrows(InvalidActionException.class, () -> gameService.moveTheToken("test", "player", 0));
  }

  @Test
  void testMoveToken_NotPlayersTurn() {
    GameState game =
        new GameState(
            "test",
            true,
            false,
            "player1",
            0,
            Arrays.asList(
                new Player("player1", "Alice", "GREEN"), new Player("player2", "Bob", "BLUE")),
            new ArrayList<>(),
            new HashMap<>(),
            new ArrayList<>());
    setGame("test", game);
    assertThrows(
        InvalidActionException.class, () -> gameService.moveTheToken("test", "player2", 0));
  }

  @Test
  void testMoveToken_ValidOpenTokenMove() {
    GameState game =
        new GameState(
            "test",
            true,
            false,
            "player1",
            0,
            Collections.singletonList(new Player("player1", "Alice", "GREEN")),
            new ArrayList<>(Collections.singletonList(new Dice(6, false))),
            new HashMap<>(),
            new ArrayList<>());
    List<Token> tokens = new ArrayList<>();
    tokens.add(new Token(0, -1, Color.GREEN));
    game.getPlayerPositions().put(0, tokens);
    setGame("test", game);
    when(ludoRule.isValidMove(any(), eq(0), eq(0))).thenReturn(true);
    when(tokenService.moveToken(any(), eq(0), eq(0), eq(6)))
        .thenReturn(new Token(0, 0, Color.GREEN));
    GameStateDTO dto = gameService.moveTheToken("test", "player1", 0);
    assertEquals(0, dto.getCurrentPlayerIndex());
  }

  @Test
  void testMoveToken_OutOfBoundary() {
    GameState game =
        new GameState(
            "test",
            true,
            false,
            "player1",
            0,
            Arrays.asList(new Player("player1", "Alice", "GREEN")),
            new ArrayList<>(Collections.singletonList(new Dice(60, false))),
            new HashMap<>(),
            new ArrayList<>());
    List<Token> tokens = new ArrayList<>();
    tokens.add(new Token(0, 50, Color.GREEN)); // Near boundary
    game.getPlayerPositions().put(0, tokens);
    setGame("test", game);
    when(ludoRule.isValidMove(any(), eq(0), eq(0))).thenReturn(false);
    assertThrows(
        InvalidActionException.class, () -> gameService.moveTheToken("test", "player1", 0));
  }

  @Test
  void testMoveToken_CutOpponentToken() {
    GameState game =
        new GameState(
            "test",
            true,
            false,
            "player1",
            0,
            Arrays.asList(
                new Player("player1", "Alice", "GREEN"), new Player("player2", "Bob", "BLUE")),
            new ArrayList<>(Collections.singletonList(new Dice(2, false))),
            new HashMap<>(),
            new ArrayList<>());
    List<Token> greenTokens = new ArrayList<>();
    greenTokens.add(new Token(0, 5, Color.GREEN));
    List<Token> blueTokens = new ArrayList<>();
    blueTokens.add(new Token(0, 7, Color.BLUE));
    game.getPlayerPositions().put(0, greenTokens);
    game.getPlayerPositions().put(1, blueTokens);
    setGame("test", game);
    when(ludoRule.isValidMove(any(), eq(0), eq(0))).thenReturn(true);
    when(tokenService.moveToken(any(), eq(0), eq(0), eq(2)))
        .thenReturn(new Token(0, 7, Color.GREEN));
    when(ludoRule.cutIfPossible(any(), any())).thenReturn(true);
    GameStateDTO dto = gameService.moveTheToken("test", "player1", 0);
    assertEquals(0, dto.getCurrentPlayerIndex());
  }

  @Test
  void testMoveToken_CheckpointNoCut() {
    GameState game =
        new GameState(
            "test",
            true,
            false,
            "player1",
            0,
            Arrays.asList(
                new Player("player1", "Alice", "GREEN"), new Player("player2", "Bob", "BLUE")),
            new ArrayList<>(Collections.singletonList(new Dice(2, false))),
            new HashMap<>(),
            new ArrayList<>());
    Token greenToken = spy(new Token(0, 7, Color.GREEN));
    doReturn(true).when(greenToken).isSafeCell();
    List<Token> greenTokens = new ArrayList<>();
    greenTokens.add(greenToken);
    List<Token> blueTokens = new ArrayList<>();
    blueTokens.add(new Token(0, 7, Color.BLUE));
    game.getPlayerPositions().put(0, greenTokens);
    game.getPlayerPositions().put(1, blueTokens);
    setGame("test", game);
    when(ludoRule.isValidMove(any(), eq(0), eq(0))).thenReturn(true);
    when(tokenService.moveToken(any(), eq(0), eq(0), eq(2))).thenReturn(greenToken);
    when(ludoRule.cutIfPossible(any(), any())).thenReturn(false);
    GameStateDTO dto = gameService.moveTheToken("test", "player1", 0);
    assertEquals(0, dto.getCurrentPlayerIndex());
  }

  @Test
  void testMoveToken_FireCell() {
    GameState game =
        new GameState(
            "test",
            true,
            false,
            "player1",
            0,
            Arrays.asList(new Player("player1", "Alice", "GREEN")),
            new ArrayList<>(Collections.singletonList(new Dice(2, false))),
            new HashMap<>(),
            new ArrayList<>());
    Token fireToken = spy(new Token(0, 10, Color.GREEN));
    doReturn(true).when(fireToken).isFire();
    List<Token> tokens = new ArrayList<>();
    tokens.add(fireToken);
    game.getPlayerPositions().put(0, tokens);
    setGame("test", game);
    when(ludoRule.isValidMove(any(), eq(0), eq(0))).thenReturn(true);
    when(tokenService.moveToken(any(), eq(0), eq(0), eq(2))).thenReturn(fireToken);
    GameStateDTO dto = gameService.moveTheToken("test", "player1", 0);
    assertEquals(0, dto.getCurrentPlayerIndex());
  }

  @Test
  void testMoveToken_AtEnd() {
    GameState game =
        new GameState(
            "test",
            true,
            false,
            "player1",
            0,
            Arrays.asList(new Player("player1", "Alice", "GREEN")),
            new ArrayList<>(Collections.singletonList(new Dice(6, false))),
            new HashMap<>(),
            new ArrayList<>());
    Token endToken = spy(new Token(0, 57, Color.GREEN));
    doReturn(true).when(endToken).isFinished();
    List<Token> tokens = new ArrayList<>();
    tokens.add(endToken);
    game.getPlayerPositions().put(0, tokens);
    setGame("test", game);
    when(ludoRule.isValidMove(any(), eq(0), eq(0))).thenReturn(true);
    when(tokenService.moveToken(any(), eq(0), eq(0), eq(6))).thenReturn(endToken);
    GameStateDTO dto = gameService.moveTheToken("test", "player1", 0);
    assertTrue(dto.isEnd() || !dto.getWinners().isEmpty());
  }

  @Test
  void testRollDice_ExtraTurn() {
    GameState game =
        new GameState(
            "test",
            true,
            false,
            "player1",
            0,
            Collections.singletonList(new Player("player1", "Alice", "GREEN")),
            new ArrayList<>(),
            new HashMap<>(),
            new ArrayList<>());
    setGame("test", game);
    // Mock diceService to add three sixes
    doAnswer(
            invocation -> {
              game.getCurrentDiceRolls().add(new Dice(6, false));
              game.getCurrentDiceRolls().add(new Dice(6, false));
              game.getCurrentDiceRolls().add(new Dice(6, false));
              return null;
            })
        .when(diceService)
        .rollDice(any(GameState.class), eq(0));
    when(ludoRule.changeTurn(any())).thenReturn(false);
    GameStateDTO dto = gameService.rollTheDice("test", 0);
    assertEquals(0, dto.getCurrentPlayerIndex());
  }

  @Test
  void testRollDice_AllTokensAtHomeAndSix() {
    GameState game =
        new GameState(
            "test",
            true,
            false,
            "player1",
            0,
            Collections.singletonList(new Player("player1", "Alice", "GREEN")),
            new ArrayList<>(Collections.singletonList(new Dice(6, false))),
            new HashMap<>(),
            new ArrayList<>());
    List<Token> tokens = new ArrayList<>();
    tokens.add(new Token(0, -1, Color.GREEN));
    game.getPlayerPositions().put(0, tokens);
    setGame("test", game);
    when(ludoRule.changeTurn(any())).thenReturn(false);
    GameStateDTO dto = gameService.rollTheDice("test", 0);
    assertEquals(0, dto.getCurrentPlayerIndex());
  }

  @Test
  void testRollDice_AllTokensAtHomeAndNotSix() {
    GameState game =
        new GameState(
            "test",
            true,
            false,
            "player1",
            0,
            Arrays.asList(
                new Player("player1", "Alice", "GREEN"), new Player("player2", "Bob", "BLUE")),
            new ArrayList<>(),
            new HashMap<>(),
            new ArrayList<>());
    List<Token> tokens = new ArrayList<>();
    tokens.add(new Token(0, -1, Color.GREEN));
    game.getPlayerPositions().put(0, tokens);
    setGame("test", game);
    // Mock diceService to add a dice roll of 5
    doAnswer(
            invocation -> {
              game.getCurrentDiceRolls().add(new Dice(5, false));
              return null;
            })
        .when(diceService)
        .rollDice(any(GameState.class), eq(0));
    when(ludoRule.changeTurn(any())).thenReturn(false);
    GameStateDTO dto = gameService.rollTheDice("test", 0);
    assertEquals(0, dto.getCurrentPlayerIndex());
  }

  // Add more tests for edge cases and valid moves as needed
}
