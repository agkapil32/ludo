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

    if (playerSize >= ApplicationConstants.maxPlayersFour) {
      System.out.println("❌ [PlayerService] Game full (" + playerSize + "/" + ApplicationConstants.maxPlayersFour + ")");
      throw new InvalidActionException("Game Player size exceeded");
    }

    if (playerName == null || playerName.trim().isEmpty()) {
      System.out.println("❌ [PlayerService] Empty player name");
      throw new InvalidActionException("Player name cannot be empty");
    }

    String playerId = UUID.randomUUID().toString();
    String playerColor = ApplicationConstants.colors.get(playerSize);

    Player newPlayer = new Player(playerId, playerName, playerColor);
    game.getPlayers().add(newPlayer);

    System.out.println("👤 [PlayerService] Added " + playerName + " (" + playerColor + ") - Count: " + game.getPlayers().size());
    return newPlayer;
  }
}
