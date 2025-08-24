package com.example.Ludo.metadata.core.interfaces;

import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.core.model.Token;

public interface GameRules {
  boolean isValidMove(GameState gameState, int playerIndex, int tokenIndex);

  boolean cutIfPossible(GameState gameState, Token token);

  boolean isExtraTurn(GameState gameState);

  boolean changeTurn(GameState gameState);
}
