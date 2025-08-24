package com.example.Ludo.metadata.core.dto;

public class DiceDTO {
  private int move;
  private boolean isUsed;

  public int getMove() {
    return move;
  }

  public void setMove(int move) {
    this.move = move;
  }

  public boolean isUsed() {
    return isUsed;
  }

  public void setUsed(boolean used) {
    isUsed = used;
  }
}
