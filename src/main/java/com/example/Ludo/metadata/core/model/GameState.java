package com.example.Ludo.metadata.core.model;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
@AllArgsConstructor
public class GameState {
  private final String gameId;
  private boolean started = false;
  private boolean end = false;
  private String currentPlayerId;
  private int currentPlayerIndex;
  private List<Player> players = new CopyOnWriteArrayList<>();
  private List<Dice> currentDiceRolls = new CopyOnWriteArrayList<>();
  private Map<Integer, List<Token>> playerPositions =
      new ConcurrentHashMap<>(); // for each players 4 dices will be there
  private List<Player> winners = new CopyOnWriteArrayList<>();
  // Store the most recent dice roll for display purposes
  private LastDiceRoll lastDiceRoll;

  public boolean hasPlayerWon(int playerIndex) {
    List<Token> tokens = playerPositions.get(playerIndex);
    if (tokens == null || tokens.isEmpty()) {
      return false; // Player hasn't won if they have no tokens or positions not initialized
    }
    return tokens.stream().allMatch(Token::isFinished);
  }

  public boolean isGameFinished() {
    return players.size() - 1
        <= playerPositions.values().stream()
            .filter(positions -> positions != null && positions.stream().allMatch(Token::isFinished))
            .count();
  }

  public List<Player> getWinners() {
    return winners;
  }
}
