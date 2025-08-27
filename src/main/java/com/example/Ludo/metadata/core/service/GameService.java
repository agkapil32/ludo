package com.example.Ludo.metadata.core.service;

import static com.example.Ludo.metadata.core.Utils.LudoUtils.cleanCurrentDiceRolls;
import static com.example.Ludo.metadata.core.Utils.LudoUtils.handleThreeSixesScenario;

import com.example.Ludo.metadata.core.dto.GameStateDTO;
import com.example.Ludo.metadata.core.dto.GameStateMapper;
import com.example.Ludo.metadata.core.enums.Color;
import com.example.Ludo.metadata.core.model.Dice;
import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.core.model.LastDiceRoll;
import com.example.Ludo.metadata.core.model.Player;
import com.example.Ludo.metadata.core.model.Token;
import com.example.Ludo.metadata.exception.GameNotFoundException;
import com.example.Ludo.metadata.exception.InvalidActionException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GameService {

  @Autowired private LudoRule ludoRule;
  @Autowired private PlayerService playerService;
  @Autowired private DiceService diceService;
  @Autowired private TokenService tokenService;

  private final Map<String, GameState> games = new ConcurrentHashMap<>();
  private final Random random = new Random();

  public GameStateDTO createGame() {
    System.out.println("🎮 [GameService] Creating new game");
    try {
      GameState game = createGameInternal();
      System.out.println("✅ [GameService] Game created successfully - GameId: " + game.getGameId());
      return GameStateMapper.mapToDTO(game);
    } catch (Exception e) {
      System.out.println("❌ [GameService] Failed to create game: " + e.getMessage());
      throw e;
    }
  }

  private GameState createGameInternal() {
    String gameId = generateUniqueGameId();
    GameState newGame = new GameState(
        gameId,
        false,
        false,
        null,
        0,
        new CopyOnWriteArrayList<>(),
        new CopyOnWriteArrayList<>(),
        new ConcurrentHashMap<>(),
        new CopyOnWriteArrayList<>(),
        null // lastDiceRoll
    );

    games.put(gameId, newGame);
    System.out.println("💾 [GameService] Game stored - ID: " + gameId + ", Total games: " + games.size());
    return newGame;
  }

  private String generateUniqueGameId() {
    String gameId;
    do {
      int fourDigitNumber = 1 + random.nextInt(9);
      gameId = String.valueOf(fourDigitNumber);
    } while (games.containsKey(gameId));
    return gameId;
  }

  public GameStateDTO addPlayer(String gameId, String playerName) {
    System.out.println("👤 [GameService] Adding player: " + playerName + " to game: " + gameId);

    GameState game = games.get(gameId);
    if (game == null) {
      System.out.println("❌ [GameService] Game not found: " + gameId);
      throw new GameNotFoundException("Game not found");
    }

    if (game.isStarted()) {
      System.out.println("❌ [GameService] Cannot add player - game already started");
      throw new InvalidActionException("Cannot add player after game has started");
    }

    playerService.addPlayer(game, playerName);
    System.out.println("✅ [GameService] Player added - New count: " + game.getPlayers().size());

    return GameStateMapper.mapToDTO(game);
  }

  public GameStateDTO startGame(String gameId) {
    System.out.println("🚀 [GameService] Starting game: " + gameId);

    GameState game = games.get(gameId);
    if (game == null) {
      System.out.println("❌ [GameService] Game not found: " + gameId);
      throw new GameNotFoundException("Game not found");
    }

    if (game.isStarted()) {
      System.out.println("❌ [GameService] Game already started");
      throw new InvalidActionException("Game is already started");
    }

    if (game.getPlayers().size() < 2) {
      System.out.println("❌ [GameService] Not enough players: " + game.getPlayers().size());
      throw new InvalidActionException("Not Enough Players");
    }

    // ✅ FIXED: Initialize player positions using actual player index, not color index
    for (int i = 0; i < game.getPlayers().size(); i++) {
      Player player = game.getPlayers().get(i);
      Color playerColor = Color.valueOf(player.getColor());

      // Use actual player index (i) instead of color.getPlayerIndex()
      game.getPlayerPositions().put(i, Token.getAllColorToken(playerColor));

      System.out.println("🎯 [GameService] Initialized player " + i + " (" + player.getName() +
                        ") with color " + playerColor + " - All tokens at home");
    }

    game.setStarted(true);
    game.setCurrentPlayerId(game.getPlayers().get(0).getId());
    game.setCurrentPlayerIndex(0);

    System.out.println("✅ [GameService] Game started - First player: " + game.getPlayers().get(0).getName());
    return GameStateMapper.mapToDTO(game);
  }

  public GameStateDTO rollTheDice(String gameId, int playerIndex) {
    System.out.println("🎲 [GameService] Dice roll request - GameId: " + gameId + ", PlayerIndex: " + playerIndex);

    GameState game = games.get(gameId);
    if (game == null) {
      System.out.println("❌ [GameService] Game not found: " + gameId);
      throw new GameNotFoundException("Game not found");
    }

    String currentPlayerName = game.getPlayers().size() > playerIndex ? game.getPlayers().get(playerIndex).getName() : "Unknown";

    if (!game.isStarted()) {
      System.out.println("❌ [GameService] Game not started");
      throw new InvalidActionException("Game has not started yet");
    }

    if (!isCurrentPlayer(game, playerIndex)) {
      String currentTurnPlayer = game.getPlayers().get(game.getCurrentPlayerIndex()).getName();
      System.out.println("❌ [GameService] Wrong turn - Current: " + currentTurnPlayer + ", Requested: " + currentPlayerName);
      throw new InvalidActionException("It's not your turn! Current turn belongs to: " + currentTurnPlayer);
    }

    // Check roll limits
    List<Dice> rolls = game.getCurrentDiceRolls();
    if (!rolls.isEmpty()) {
      Dice lastRoll = rolls.get(rolls.size() - 1);
      long rollCount = rolls.size();

      if (!(lastRoll.isSix() && rollCount < 3)) {
        System.out.println("❌ [GameService] Cannot roll again - Last: " + lastRoll.getMove() + ", Count: " + rollCount);
        throw new InvalidActionException("You can only roll again if the previous roll was a six and less than 3 rolls in this turn");
      }
    }

    diceService.rollDice(game, playerIndex);
    Dice latestDice = game.getCurrentDiceRolls().get(game.getCurrentDiceRolls().size() - 1);
    System.out.println("🎯 [GameService] " + currentPlayerName + " rolled: " + latestDice.getMove());

    // Record last dice roll for display (even if turn changes)
    game.setLastDiceRoll(LastDiceRoll.builder()
        .playerIndex(playerIndex)
        .move(latestDice.getMove())
        .timestamp(System.currentTimeMillis())
        .rollId(game.getGameId() + "-" + playerIndex + "-" + System.currentTimeMillis())
        .build());

    // ✅ ENHANCED: Better debugging and null safety for turn change logic
    List<Token> tokens = game.getPlayerPositions().get(playerIndex);

    if (tokens == null) {
      System.out.println("❌ [GameService] " + currentPlayerName + " - No tokens found for player index: " + playerIndex);
      System.out.println("📊 [GameService] Available player positions: " + game.getPlayerPositions().keySet());
      // Try to recover by checking if tokens exist under color index
      String playerColor = game.getPlayers().get(playerIndex).getColor();
      Color color = Color.valueOf(playerColor);
      tokens = game.getPlayerPositions().get(color.getPlayerIndex());
      if (tokens != null) {
        System.out.println("🔧 [GameService] Found tokens under color index: " + color.getPlayerIndex());
        // Fix the mapping
        game.getPlayerPositions().put(playerIndex, tokens);
        game.getPlayerPositions().remove(color.getPlayerIndex());
      }
    }

    boolean allAtHome = tokens != null && tokens.stream().allMatch(t -> t.getCurrentPosition() == -1);

    System.out.println("🏠 [GameService] " + currentPlayerName + " - All tokens at home: " + allAtHome + ", Dice: " + latestDice.getMove());
    if (tokens != null) {
      System.out.println("📊 [GameService] " + currentPlayerName + " token positions: " +
        tokens.stream().map(t -> t.getCurrentPosition()).toList());
    } else {
      System.out.println("❌ [GameService] " + currentPlayerName + " - tokens is null!");
    }

    // ✅ FIXED: Consistent turn change logic for all players
    if (allAtHome && latestDice.getMove() != 6) {
      System.out.println("🔄 [GameService] " + currentPlayerName + " - All tokens home + no 6 = turn change");
      game.getCurrentDiceRolls().clear();
      ludoRule.changeTurn(game);
      System.out.println("✅ [GameService] Turn changed from " + currentPlayerName + " to " + game.getPlayers().get(game.getCurrentPlayerIndex()).getName());
    }

    // ✅ ENHANCED: Better three sixes handling
    if (handleThreeSixesScenario(game)) {
      System.out.println("🚫 [GameService] " + currentPlayerName + " - Three sixes - turn change");
      game.getCurrentDiceRolls().clear();
      ludoRule.changeTurn(game);
      System.out.println("✅ [GameService] Turn changed due to three sixes");
    }

    return GameStateMapper.mapToDTO(game);
  }

  private boolean isCurrentPlayer(GameState game, int playerIndex) {
    return game.getCurrentPlayerIndex() == playerIndex;
  }

  private Dice getNextUnusedDice(GameState game) {
    return game.getCurrentDiceRolls().stream().filter(d -> !d.isUsed()).findFirst().orElse(null);
  }

  public GameStateDTO moveTheToken(String gameId, int playerIndex, int tokenIndex) {
    System.out.println("🚀 [GameService] Token move - GameId: " + gameId + ", Player: " + playerIndex + ", Token: " + tokenIndex);

    GameState game = games.get(gameId);
    if (game == null) {
      System.out.println("❌ [GameService] Game not found: " + gameId);
      throw new GameNotFoundException("Game not found");
    }

    if (!game.isStarted()) {
      System.out.println("❌ [GameService] Game not started");
      throw new InvalidActionException("Game has not started yet");
    }

    if (!isCurrentPlayer(game, playerIndex)) {
      System.out.println("❌ [GameService] Wrong player turn");
      throw new InvalidActionException("It's not the turn for playerIndex: " + playerIndex);
    }

    if (!ludoRule.isValidMove(game, playerIndex, tokenIndex)) {
      System.out.println("❌ [GameService] Invalid move");
      throw new InvalidActionException("Invalid move for player or token");
    }

    if (ludoRule.isExtraTurn(game)) {
      System.out.println("❌ [GameService] Player has extra turn");
      throw new InvalidActionException("Player has an extra turn, cannot move token now");
    }

    Dice diceToUse = getNextUnusedDice(game);
    if (diceToUse == null) {
      System.out.println("❌ [GameService] No available dice");
      throw new InvalidActionException("No available dice to use");
    }

    Token movedToken = tokenService.moveToken(game, playerIndex, tokenIndex, diceToUse.getMove());
    diceToUse.setUsed(true);
    cleanCurrentDiceRolls(game);
    ludoRule.cutIfPossible(game, movedToken);

    // Check for win
    if (game.hasPlayerWon(playerIndex)) {
      Player winner = game.getPlayers().get(playerIndex);
      if (!game.getWinners().contains(winner)) {
        System.out.println("🏆 [GameService] Player won: " + winner.getName());
        game.getWinners().add(winner);
      }
      if (game.isGameFinished()) {
        System.out.println("🎊 [GameService] Game finished!");
        game.setEnd(true);
      }
    }

    System.out.println("✅ [GameService] Token moved to: " + movedToken.getCurrentPosition());
    return GameStateMapper.mapToDTO(game);
  }

  public GameStateDTO getGameState(String gameId) {

    GameState game = games.get(gameId);
    if (game == null) {
      System.out.println("❌ [GameService] Game not found: " + gameId);
      throw new GameNotFoundException("Game not found");
    }

    return GameStateMapper.mapToDTO(game);
  }

  // For testing: Add a specific GameState to the games map
  public void addTestGameState() {
    String gameId = "test1";
    List<Player> players = new ArrayList<>();
    players.add(new Player("f55c037e-0de0-46b8-a401-dea976525c55", "Alice", "GREEN"));
    players.add(new Player("553789bd-fde1-41b7-b5c8-0ff224963602", "bob", "BLUE"));
    players.add(new Player("fb8f7502-f561-4d45-9bd1-30a83b02173e", "john", "RED"));
    players.add(new Player("d2dc1a04-1898-4d3b-8526-e13d6ffa6361", "Kapil", "YELLOW"));

    List<Dice> currentDiceRolls = new ArrayList<>();
    currentDiceRolls.add(new Dice(5, false));

    Map<Integer, List<Token>> playerPositions = new HashMap<>();
    for (int i = 0; i < 4; i++) {
      List<Token> tokens = new ArrayList<>();
      for (int j = 0; j < 5; j++) {
        tokens.add(new Token(j, -1, com.example.Ludo.metadata.core.enums.Color.values()[i]));
      }
      playerPositions.put(i, tokens);
    }

    GameState gameState =
        new GameState(
            gameId,
            true,
            false,
            "f55c037e-0de0-46b8-a401-dea976525c55",
            0,
            players,
            currentDiceRolls,
            playerPositions,
            new ArrayList<>(),
            null // lastDiceRoll
        );
    games.put(gameId, gameState);
  }
}
