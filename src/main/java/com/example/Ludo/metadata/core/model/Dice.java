package com.example.Ludo.metadata.core.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Dice {
  private int move;
  private boolean isUsed;

  public boolean isSix() {
    return move == 6;
  }
}
