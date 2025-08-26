package com.example.Ludo.metadata.core.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
@AllArgsConstructor
public class Dice {
  @JsonProperty("value")  // ✅ Maps to frontend "value" field
  private int move;

  @JsonProperty("used")   // ✅ Maps to frontend "used" field
  private boolean isUsed;

  public boolean isSix() {
    return move == 6;
  }

  // ✅ Add getter methods that match frontend expectations
  public int getValue() {
    return move;
  }

  public boolean isUsed() {
    return isUsed;
  }
}
