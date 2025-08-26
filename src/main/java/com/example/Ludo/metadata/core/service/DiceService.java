package com.example.Ludo.metadata.core.service;

import com.example.Ludo.metadata.core.Utils.LudoUtils;
import com.example.Ludo.metadata.core.model.Dice;
import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.exception.InvalidActionException;
import java.util.Objects;
import org.springframework.stereotype.Service;

@Service
public class DiceService {
  public Dice rollDice(GameState game, int playerIndex) {
    if (game.isEnd()) {
      System.out.println("❌ [DiceService] Cannot roll - game over");
      throw new InvalidActionException("Cannot roll dice, game is over");
    }

    if (!Objects.equals(game.getCurrentPlayerIndex(), playerIndex)) {
      System.out.println("❌ [DiceService] Wrong player turn");
      throw new InvalidActionException("Not a turn for this playerId");
    }

    String currentPlayerName = game.getPlayers().get(playerIndex).getName();
    int diceValue = LudoUtils.getRandomValue();

    Dice dice = new Dice(diceValue, false);
    game.getCurrentDiceRolls().add(dice);

    System.out.println("🎲 [DiceService] " + currentPlayerName + " rolled: " + diceValue);
    return dice;
  }
}
