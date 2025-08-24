package com.example.Ludo.metadata.core.model;

import static com.example.Ludo.metadata.core.constants.ApplicationConstants.*;

import com.example.Ludo.metadata.core.enums.Color;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Token {
  private int tokenIndex;
  private int currentPosition;
  private Color color;

  public int getGlobalPosition() {
    if (currentPosition == -1) return -1;
    return (color.getGlobalPosition() + currentPosition) % 52;
  }

  public static List<Token> getAllColorToken(Color color) {
    List<Token> tokens = new ArrayList<>();
    for (int tokenIndex = 0; tokenIndex < 4; tokenIndex++) { // Changed from 5 to 4
      tokens.add(new Token(tokenIndex, -1, color));
    }
    return tokens;
  }

  public boolean isOpen() {
    return currentPosition != -1;
  }

  public boolean isFire() {
    return getGlobalPosition() == firePosition;
  }

  public boolean isFinished() {
    return getGlobalPosition() == endPosition;
  }

  public boolean isSafeCell() {
    return SafeCells.contains(getGlobalPosition());
  }
}
