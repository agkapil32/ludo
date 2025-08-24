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
      throw new InvalidActionException("Cannot roll dice, game is over");
    }
    if (!Objects.equals(game.getCurrentPlayerIndex(), playerIndex)) {
      throw new InvalidActionException("Not a turn for this playerId");
    }
    Dice dice = new Dice(LudoUtils.getRandomValue(), false);
    game.getCurrentDiceRolls().add(dice);

    // Simple log of dice number
    System.out.println("Dice rolled: " + dice.getMove());

    return dice;
  }
}
