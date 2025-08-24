package com.example.Ludo.metadata.core.dto;

import java.util.List;
import java.util.Map;

public class GameStateDTO {
  private String gameId;
  private boolean started;
  private boolean end;
  private String currentPlayerId;
  private int currentPlayerIndex;
  private List<PlayerDTO> players;
  private List<DiceDTO> currentDiceRolls;
  private List<PlayerDTO> winners;
  private Map<Integer, List<TokenDTO>> playerPositions;

  // You can add more fields as needed, e.g., playerPositions summary

  // Getters and setters
  public String getGameId() {
    return gameId;
  }

  public void setGameId(String gameId) {
    this.gameId = gameId;
  }

  public boolean isStarted() {
    return started;
  }

  public void setStarted(boolean started) {
    this.started = started;
  }

  public boolean isEnd() {
    return end;
  }

  public void setEnd(boolean end) {
    this.end = end;
  }

  public String getCurrentPlayerId() {
    return currentPlayerId;
  }

  public void setCurrentPlayerId(String currentPlayerId) {
    this.currentPlayerId = currentPlayerId;
  }

  public int getCurrentPlayerIndex() {
    return currentPlayerIndex;
  }

  public void setCurrentPlayerIndex(int currentPlayerIndex) {
    this.currentPlayerIndex = currentPlayerIndex;
  }

  public List<PlayerDTO> getPlayers() {
    return players;
  }

  public void setPlayers(List<PlayerDTO> players) {
    this.players = players;
  }

  public List<DiceDTO> getCurrentDiceRolls() {
    return currentDiceRolls;
  }

  public void setCurrentDiceRolls(List<DiceDTO> currentDiceRolls) {
    this.currentDiceRolls = currentDiceRolls;
  }

  public List<PlayerDTO> getWinners() {
    return winners;
  }

  public void setWinners(List<PlayerDTO> winners) {
    this.winners = winners;
  }

  public Map<Integer, List<TokenDTO>> getPlayerPositions() {
    return playerPositions;
  }

  public void setPlayerPositions(Map<Integer, List<TokenDTO>> playerPositions) {
    this.playerPositions = playerPositions;
  }
}
