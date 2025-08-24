package com.example.Ludo.metadata.core.Utils;

import com.example.Ludo.metadata.core.model.Dice;
import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.core.model.Token;
import com.example.Ludo.metadata.exception.InvalidActionException;
import java.util.List;
import java.util.Random;

public class LudoUtils {

  public static Token findTokenByIndex(GameState gameState, int playerIndex, int tokenIndex) {
    return gameState.getPlayerPositions().get(playerIndex).stream()
        .filter(t -> t.getTokenIndex() == tokenIndex)
        .findFirst()
        .orElseThrow(() -> new InvalidActionException("Token not found with index: " + tokenIndex));
  }

  public static void cleanCurrentDiceRolls(GameState gameState) {
    List<Dice> rolls = gameState.getCurrentDiceRolls();
    boolean allUsed = rolls.stream().allMatch(Dice::isUsed);
    if (allUsed) {
      rolls.removeIf(d -> d.isUsed());
    }
  }

  public static int getRandomValue() {
    return new Random().nextInt(6) + 1;
  }

  public static boolean handleThreeSixesScenario(GameState gameState) {
    List<Dice> rolls = gameState.getCurrentDiceRolls();
    int sixes = (int) rolls.stream().filter(Dice::isSix).count();
    return sixes == 3;
  }
}
