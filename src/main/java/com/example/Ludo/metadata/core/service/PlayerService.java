package com.example.Ludo.metadata.core.service;

import com.example.Ludo.metadata.core.constants.ApplicationConstants;
import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.core.model.Player;
import com.example.Ludo.metadata.exception.InvalidActionException;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class PlayerService {
  public Player addPlayer(GameState game, String playerName) {
    int playerSize = game.getPlayers().size();
    if (playerSize >= ApplicationConstants.maxPlayersFour)
      throw new InvalidActionException("Game Player size exceeded");
    if (playerName == null || playerName.trim().isEmpty())
      throw new InvalidActionException("Player name cannot be empty");
    // No check for duplicate player name, only playerId must be unique
    Player newPlayer =
        new Player(
            UUID.randomUUID().toString(), playerName, ApplicationConstants.colors.get(playerSize));
    game.getPlayers().add(newPlayer);
    return newPlayer;
  }
}
