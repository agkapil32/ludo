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
   */
  @Override
  public boolean isValidMove(GameState gameState, int playerIndex, int tokenIndex) {
    if (!Objects.equals(gameState.getCurrentPlayerIndex(), playerIndex)) {
      System.out.println("❌ [LudoRule] Wrong player turn");
      throw new InvalidActionException("Not a turn for this playerIndex");
    }
    
    if (gameState.isEnd()) {
      System.out.println("❌ [LudoRule] Game ended");
      throw new InvalidActionException("Game has ended");
    }

    int used = 0;
    for (Dice dice : gameState.getCurrentDiceRolls()) {
      if (dice.isUsed()) {
        used++;
      } else {
        Token result = LudoUtils.findTokenByIndex(gameState, playerIndex, tokenIndex);
        if (result == null) {
          System.out.println("❌ [LudoRule] Token not found - Player: " + playerIndex + ", Token: " + tokenIndex);
          throw new InvalidActionException("Token not found for player or token index");
        }

        if (canMoveToken(result, dice)) {
          System.out.println("✅ [LudoRule] Valid move with dice: " + dice.getMove());
          return true;
        }
      }
    }

    if (used == 3) {
      System.out.println("🚫 [LudoRule] All dice used");
    }

    System.out.println("❌ [LudoRule] No valid move found");
    throw new InvalidActionException("Invalid move for player or token");
  }

  /**
   * Checks if a token can be moved with the given dice.
   */
  private boolean canMoveToken(Token token, Dice dice) {
    if (token.isOpen() && token.getGlobalPosition() + dice.getMove() < endPosition + 1) {
      return true;
    } else if (!token.isOpen() && dice.getMove() == 6) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Cuts the opponent's token if possible.
   */
  @Override
  public boolean cutIfPossible(GameState gameState, Token token) {
    boolean flag = false;
    int cutsCount = 0;

    for (var playerPositions : gameState.getPlayerPositions().values()) {
      for (Token playerToken : playerPositions) {
        if (playerToken.getColor() != token.getColor()
            && token.getGlobalPosition() == playerToken.getGlobalPosition()
            && !playerToken.isSafeCell()) {

          playerToken.setCurrentPosition(-1);
          flag = true;
          cutsCount++;
        }
      }
    }

    if (cutsCount > 0) {
      System.out.println("✂️ [LudoRule] Cut " + cutsCount + " opponent token(s)");
    }

    return flag;
  }

  /**
   * Checks if the current player gets an extra turn.
   */
  @Override
  public boolean isExtraTurn(GameState gameState) {
    List<Dice> rolls = gameState.getCurrentDiceRolls();
    int sixes = (int) rolls.stream().filter(Dice::isSix).count();
    boolean isExtra = sixes == rolls.size();

    if (isExtra) {
      System.out.println("🔄 [LudoRule] Extra turn - all dice are sixes");
    }

    return isExtra;
  }

  /**
   * Changes the turn to the next player.
   */
  @Override
  public boolean changeTurn(GameState gameState) {
    if (gameState.isGameFinished()) {
      System.out.println("❌ [LudoRule] Cannot change turn - game finished");
      throw new InvalidActionException("Cannot change turn, Game is already finished");
    }

    int actualPlayerCount = gameState.getPlayers().size();
    int increment = 1;

    while (true) {
      int currentPlayerIndex = (gameState.getCurrentPlayerIndex() + increment) % actualPlayerCount;

      if (!gameState.hasPlayerWon(currentPlayerIndex)) {
        String newPlayerId = gameState.getPlayers().get(currentPlayerIndex).getId();
        String newPlayerName = gameState.getPlayers().get(currentPlayerIndex).getName();

        gameState.setCurrentPlayerId(newPlayerId);
        gameState.setCurrentPlayerIndex(currentPlayerIndex);

        System.out.println("🔄 [LudoRule] Turn changed to: " + newPlayerName + " (Index: " + currentPlayerIndex + ")");
        break;
      }

      increment++;
      if (increment > actualPlayerCount) {
        System.out.println("❌ [LudoRule] Unable to find next player");
        throw new InvalidActionException("[Unexpected] Unable to change turn gameId: " + gameState.getGameId());
      }
    }

    return false;
  }
}
