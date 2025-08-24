package com.example.Ludo.metadata.core.service;

import static com.example.Ludo.metadata.core.Utils.LudoUtils.cleanCurrentDiceRolls;
import static com.example.Ludo.metadata.core.Utils.LudoUtils.handleThreeSixesScenario;

import com.example.Ludo.metadata.core.dto.GameStateDTO;
import com.example.Ludo.metadata.core.dto.GameStateMapper;
import com.example.Ludo.metadata.core.enums.Color;
import com.example.Ludo.metadata.core.model.Dice;
import com.example.Ludo.metadata.core.model.GameState;
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

  public GameStateDTO createGame() {
    GameState game = createGameInternal();
    return GameStateMapper.mapToDTO(game);
  }

  private GameState createGameInternal() {
    String gameId = UUID.randomUUID().toString();
    GameState newGame =
        new GameState(
            gameId,
            false,
            false,
            null,
            0,
            new CopyOnWriteArrayList<>(),
            new CopyOnWriteArrayList<>(),
            new ConcurrentHashMap<>(),
            new CopyOnWriteArrayList<>());
    games.put(gameId, newGame);
    return newGame;
  }

  public GameStateDTO addPlayer(String gameId, String playerName) {
    GameState game = games.get(gameId);
    if (game == null) throw new GameNotFoundException("Game not found");
    if (game.isStarted())
      throw new InvalidActionException("Cannot add player after game has started");
    playerService.addPlayer(game, playerName);
    return GameStateMapper.mapToDTO(game);
  }

  public GameStateDTO startGame(String gameId) {
    GameState game = games.get(gameId);
    if (game == null) throw new GameNotFoundException("Game not found");
    if (game.isStarted()) throw new InvalidActionException("Game is already started");
    if (game.getPlayers().size() < 2) throw new InvalidActionException("Not Enough Players");
    for (Player player : game.getPlayers()) {
      Color playerColor = Color.valueOf(player.getColor());
      game.getPlayerPositions()
          .put(playerColor.getPlayerIndex(), Token.getAllColorToken(playerColor));
    }
    game.setStarted(true);
    game.setCurrentPlayerId(game.getPlayers().get(0).getId());
    game.setCurrentPlayerIndex(0);
    return GameStateMapper.mapToDTO(game);
  }

  public GameStateDTO rollTheDice(String gameId, int playerIndex) {
    GameState game = games.get(gameId);
    // Check if game is started
    if (!game.isStarted()) {
      throw new InvalidActionException("Game has not started yet");
    }
    // Enforce Ludo rule: after first roll, only allow another roll if previous roll was a six and
    // less than 3 rolls
    List<Dice> rolls = game.getCurrentDiceRolls();
    if (!rolls.isEmpty()) {
      Dice lastRoll = rolls.get(rolls.size() - 1);
      long rollCount = rolls.size();
      if (!(lastRoll.isSix() && rollCount < 3)) {
        throw new InvalidActionException(
            "You can only roll again if the previous roll was a six and less than 3 rolls in this turn");
      }
    }
    diceService.rollDice(game, playerIndex);
    // Check if all tokens are at home and dice is not 6, then change turn
    Dice lastDice = game.getCurrentDiceRolls().get(game.getCurrentDiceRolls().size() - 1);
    List<Token> tokens = game.getPlayerPositions().get(playerIndex);
    boolean allAtHome =
        tokens != null && tokens.stream().allMatch(t -> t.getCurrentPosition() == -1);
    if (allAtHome && lastDice.getMove() != 6) {
      game.getCurrentDiceRolls().clear();
      ludoRule.changeTurn(game);
    }
    if (handleThreeSixesScenario(game)) {
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
    GameState game = games.get(gameId);
    System.out.printf("moveTheToken called: gameId=%s, playerIndex=%d, tokenIndex=%d\n", gameId, playerIndex, tokenIndex);
    if (game == null) {
      System.out.println("Game not found for gameId=" + gameId);
      throw new GameNotFoundException("Game not found");
    }
    if (!game.isStarted()) {
      System.out.println("Game not started for gameId=" + gameId);
      throw new InvalidActionException("Game has not started yet");
    }
    if (!isCurrentPlayer(game, playerIndex)) {
      System.out.printf("Not current player: expected=%d, got=%d\n", game.getCurrentPlayerIndex(), playerIndex);
      throw new InvalidActionException("It's not the turn for playerIndex: " + playerIndex);
    }
    if (!ludoRule.isValidMove(game, playerIndex, tokenIndex)) {
      System.out.printf("Invalid move: playerIndex=%d, tokenIndex=%d\n", playerIndex, tokenIndex);
      throw new InvalidActionException("Invalid move for player or token");
    }
    if (ludoRule.isExtraTurn(game)) {
      System.out.println("Player has an extra turn, cannot move token now");
      throw new InvalidActionException("Player has an extra turn, cannot move token now");
    }
    Dice diceToUse = getNextUnusedDice(game);
    if (diceToUse == null) {
      System.out.println("No available dice to use");
      throw new InvalidActionException("No available dice to use");
    }
    System.out.printf("Moving token: playerIndex=%d, tokenIndex=%d, diceMove=%d\n", playerIndex, tokenIndex, diceToUse.getMove());
    Token movedToken =
        tokenService.moveToken(game, playerIndex, tokenIndex, diceToUse.getMove());
    diceToUse.setUsed(true);
    cleanCurrentDiceRolls(game);
    ludoRule.cutIfPossible(game, movedToken);
    // Check for win/game end after move
    if (game.hasPlayerWon(playerIndex)) {
      Player winner = game.getPlayers().get(playerIndex);
      if (!game.getWinners().contains(winner)) {
        System.out.printf("Player won: playerId=%s, color=%s\n", winner.getId(), winner.getColor());
        game.getWinners().add(winner);
      }
      if (game.isGameFinished()) {
        game.setEnd(true);
      }
    }
    return GameStateMapper.mapToDTO(game);
  }

  public GameStateDTO getGameState(String gameId) {
    GameState game = games.get(gameId);
    if (game == null) throw new GameNotFoundException("Game not found");
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
            new ArrayList<>());
    games.put(gameId, gameState);
  }
}
