package com.example.Ludo.metadata.core.service;

import static com.example.Ludo.metadata.core.constants.ApplicationConstants.endPosition;

import com.example.Ludo.metadata.core.Utils.LudoUtils;
import com.example.Ludo.metadata.core.constants.ApplicationConstants;
import com.example.Ludo.metadata.core.interfaces.GameRules;
import com.example.Ludo.metadata.core.model.Dice;
import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.core.model.Token;
import com.example.Ludo.metadata.exception.InvalidActionException;
import java.util.List;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class LudoRule implements GameRules {
  private static final Logger logger = LoggerFactory.getLogger(LudoRule.class);
  private static final int PLAYER_COUNT = ApplicationConstants.maxPlayersFour;

  /**
   * Checks if the move is valid for the given player and token.
   *
   * @param gameState the current game state
   * @param playerIndex the index of the player
   * @param tokenIndex the index of the token
   * @return true if the move is valid, false otherwise
   */
  @Override
  public boolean isValidMove(GameState gameState, int playerIndex, int tokenIndex) {

    if (!Objects.equals(gameState.getCurrentPlayerIndex(), playerIndex)) {
      throw new InvalidActionException("Not a turn for this playerIndex");
    }
    if (gameState.isEnd()) throw new InvalidActionException("Game has ended");

    int used = 0;
    for (Dice dice : gameState.getCurrentDiceRolls()) {
      if (dice.isUsed()) used++;
      else {
        Token result = LudoUtils.findTokenByIndex(gameState, playerIndex, tokenIndex);
        if (result == null) {
          logger.warn(
              "Token not found for playerIndex {} and tokenIndex {}", playerIndex, tokenIndex);
          throw new InvalidActionException("Token not found for player or token index");
        }
        if (canMoveToken(result, dice)) return true;
      }
    }
    if (used == 3) {
      logger.warn(
          "All dice used for playerIndex {} in game {}", playerIndex, gameState.getGameId());
    }
    // If no valid move found, throw exception
    throw new InvalidActionException("Invalid move for player or token");
  }

  /**
   * Checks if a token can be moved with the given dice.
   *
   * @param token the token to move
   * @param dice the dice roll
   * @return true if the token can be moved, false otherwise
   */
  private boolean canMoveToken(Token token, Dice dice) {
    if (token.isOpen() && token.getGlobalPosition() + dice.getMove() < endPosition + 1) return true;
    else return !token.isOpen() && dice.getMove() == 6;
  }

  /**
   * Cuts the opponent's token if possible.
   *
   * @param gameState the current game state
   * @param token the token of the current player
   * @return true if an opponent's token was cut, false otherwise
   */
  @Override
  public boolean cutIfPossible(GameState gameState, Token token) {
    boolean flag = false;
    for (var playerPositions : gameState.getPlayerPositions().values()) {
      for (Token playerToken : playerPositions) {
        if (playerToken.getColor() != token.getColor()
            && token.getGlobalPosition() == playerToken.getGlobalPosition()
            && !playerToken.isSafeCell()) {
          logger.info(
              "Captured other player's token, playerToken: {} CurrentToken: {}",
              playerToken,
              token);
          playerToken.setCurrentPosition(-1);
          flag = true;
        }
      }
    }
    return flag;
  }

  /**
   * Checks if the current player gets an extra turn.
   *
   * @param gameState the current game state
   * @return true if the player gets an extra turn, false otherwise
   */
  @Override
  public boolean isExtraTurn(GameState gameState) {
    List<Dice> rolls = gameState.getCurrentDiceRolls();
    int sixes = (int) rolls.stream().filter(Dice::isSix).count();
    return sixes == rolls.size();
  }

  /**
   * Changes the turn to the next player.
   *
   * @param gameState the current game state
   * @return false
   */
  @Override
  public boolean changeTurn(GameState gameState) {
    if (gameState.isGameFinished())
      throw new InvalidActionException("Cannot change turn, Game is already finished");

    int actualPlayerCount = gameState.getPlayers().size(); // Use actual number of players
    int increment = 1;
    while (true) {
      int currentPlayerIndex = (gameState.getCurrentPlayerIndex() + increment) % actualPlayerCount;
      if (!gameState.hasPlayerWon(currentPlayerIndex)) {
        gameState.setCurrentPlayerId(gameState.getPlayers().get(currentPlayerIndex).getId());
        gameState.setCurrentPlayerIndex(currentPlayerIndex);
        break;
      }
      increment++;
      if (increment > actualPlayerCount)
        throw new InvalidActionException(
            "[Unexpected] Unable to change turn gameId: " + gameState.getGameId());
    }
    return false;
  }
}
