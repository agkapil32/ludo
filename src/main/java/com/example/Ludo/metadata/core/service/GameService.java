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
    try {
      GameState game = createGameInternal();
      return GameStateMapper.mapToDTO(game);
    } catch (Exception e) {
      System.out.println("❌ Failed to create game: " + e.getMessage());
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
    GameState game = games.get(gameId);
    if (game == null) {
      throw new GameNotFoundException("Game not found");
    }

    String currentPlayerName = game.getPlayers().size() > playerIndex ? game.getPlayers().get(playerIndex).getName() : "Unknown";

    if (!game.isStarted()) {
      throw new InvalidActionException("Game has not started yet");
    }

    if (!isCurrentPlayer(game, playerIndex)) {
      String currentTurnPlayer = game.getPlayers().get(game.getCurrentPlayerIndex()).getName();
      throw new InvalidActionException("It's not your turn! Current turn belongs to: " + currentTurnPlayer);
    }

    // Check roll limits
    List<Dice> rolls = game.getCurrentDiceRolls();
    if (!rolls.isEmpty()) {
      Dice lastRoll = rolls.get(rolls.size() - 1);
      long rollCount = rolls.size();

      if (!(lastRoll.isSix() && rollCount < 3)) {
        throw new InvalidActionException("You can only roll again if the previous roll was a six and less than 3 rolls in this turn");
      }
    }

    diceService.rollDice(game, playerIndex);
    Dice latestDice = game.getCurrentDiceRolls().get(game.getCurrentDiceRolls().size() - 1);
    System.out.println("🎲 " + currentPlayerName + " rolled: " + latestDice.getMove());

    // Record last dice roll for display (even if turn changes)
    game.setLastDiceRoll(LastDiceRoll.builder()
        .playerIndex(playerIndex)
        .move(latestDice.getMove())
        .timestamp(System.currentTimeMillis())
        .rollId(game.getGameId() + "-" + playerIndex + "-" + System.currentTimeMillis())
        .build());

    List<Token> tokens = game.getPlayerPositions().get(playerIndex);

    if (tokens == null) {
      // Try to recover by checking if tokens exist under color index
      String playerColor = game.getPlayers().get(playerIndex).getColor();
      Color color = Color.valueOf(playerColor);
      tokens = game.getPlayerPositions().get(color.getPlayerIndex());
      if (tokens != null) {
        // Fix the mapping
        game.getPlayerPositions().put(playerIndex, tokens);
        game.getPlayerPositions().remove(color.getPlayerIndex());
      }
    }

    boolean allAtHome = tokens != null && tokens.stream().allMatch(t -> t.getCurrentPosition() == -1);

    // Check if player has any usable dice (6s for opening tokens, or any dice if tokens are open)
    boolean hasUsableDice = false;
    for (Dice dice : game.getCurrentDiceRolls()) {
      if (!dice.isUsed()) {
        // If player has tokens on board, any unused dice is usable
        if (!allAtHome) {
          hasUsableDice = true;
          break;
        }
        // If all tokens at home, only 6s are usable
        if (dice.getMove() == 6) {
          hasUsableDice = true;
          break;
        }
      }
    }

    // Only change turn if player has no usable dice AND last roll wasn't a 6
    if (allAtHome && !hasUsableDice && latestDice.getMove() != 6) {
      System.out.println("🔄 " + currentPlayerName + " turn ends (no usable dice)");
      game.getCurrentDiceRolls().clear();
      ludoRule.changeTurn(game);
    }

    // Three sixes handling
    if (handleThreeSixesScenario(game)) {
      System.out.println("🚫 " + currentPlayerName + " turn ends (three sixes)");
      game.getCurrentDiceRolls().clear();
      ludoRule.changeTurn(game);
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

    // ✅ ADDED: Check if turn should end after token move
    List<Dice> remainingDice = game.getCurrentDiceRolls();
    boolean hasUnusedDice = remainingDice.stream().anyMatch(d -> !d.isUsed());

    if (!hasUnusedDice) {
      // All dice used - check if player gets another turn due to sixes
      boolean hasSixes = remainingDice.stream().anyMatch(Dice::isSix);
      if (!hasSixes) {
        // No sixes, turn ends
        String currentPlayerName = game.getPlayers().get(playerIndex).getName();
        System.out.println("🔄 [GameService] " + currentPlayerName + " - All dice used, no sixes = turn change");
        game.getCurrentDiceRolls().clear();
        ludoRule.changeTurn(game);
        System.out.println("✅ [GameService] Turn changed from " + currentPlayerName + " to " + game.getPlayers().get(game.getCurrentPlayerIndex()).getName());
      } else {
        // Has sixes, clear dice for next roll but keep turn
        System.out.println("🎲 [GameService] " + game.getPlayers().get(playerIndex).getName() + " - All dice used but has sixes, can roll again");
        game.getCurrentDiceRolls().clear();
      }
    }

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
