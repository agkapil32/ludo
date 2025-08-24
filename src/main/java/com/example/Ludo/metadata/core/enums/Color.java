package com.example.Ludo.metadata.core.enums;

import lombok.Getter;

@Getter
public enum Color {
  BLUE("BLUE", 0, 0),
  RED("RED", 1, 13),
  GREEN("GREEN", 2, 26),
  YELLOW("YELLOW", 3, 39);

  private String color;
  private int playerIndex;
  private final int globalPosition;

  Color(String color, Integer playerIndex, Integer globalPosition) {
    this.color = color;
    this.playerIndex = playerIndex;
    this.globalPosition = globalPosition;
  }
}
