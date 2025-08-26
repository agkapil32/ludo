package com.example.Ludo.metadata.core.Utils;

import com.example.Ludo.metadata.core.model.Dice;
import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.core.model.Token;
import com.example.Ludo.metadata.exception.InvalidActionException;
import java.util.List;
import java.util.Random;

public class LudoUtils {

  public static Token findTokenByIndex(GameState gameState, int playerIndex, int tokenIndex) {
    try {
      List<Token> playerTokens = gameState.getPlayerPositions().get(playerIndex);
      if (playerTokens == null) {
        throw new InvalidActionException("No tokens found for player index: " + playerIndex);
      }

      Token result = playerTokens.stream()
          .filter(t -> t.getTokenIndex() == tokenIndex)
          .findFirst()
          .orElseThrow(() -> new InvalidActionException("Token not found with index: " + tokenIndex));

      return result;
    } catch (Exception e) {
      System.out.println("❌ [LudoUtils] Error finding token: " + e.getMessage());
      throw e;
    }
  }

  public static void cleanCurrentDiceRolls(GameState gameState) {
    List<Dice> rolls = gameState.getCurrentDiceRolls();
    boolean allUsed = rolls.stream().allMatch(Dice::isUsed);

    if (allUsed) {
      int beforeSize = rolls.size();
      rolls.removeIf(d -> d.isUsed());
      System.out.println("🧹 [LudoUtils] Cleaned dice rolls: " + beforeSize + " → " + rolls.size());
    }
  }

  public static int getRandomValue() {
    return new Random().nextInt(6) + 1;
  }

  public static boolean handleThreeSixesScenario(GameState gameState) {
    List<Dice> rolls = gameState.getCurrentDiceRolls();
    int sixes = (int) rolls.stream().filter(Dice::isSix).count();
    boolean isThreeSixes = sixes == 3;

    if (isThreeSixes) {
      System.out.println("⚠️ [LudoUtils] THREE SIXES DETECTED - ending turn");
    }

    return isThreeSixes;
  }
}
