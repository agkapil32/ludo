package com.example.Ludo.metadata.core.service;

import com.example.Ludo.metadata.core.Utils.LudoUtils;
import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.core.model.Token;
import com.example.Ludo.metadata.exception.InvalidActionException;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
  public Token moveToken(GameState gameState, int playerIndex, int tokenIndex, int move) {
    Token token = LudoUtils.findTokenByIndex(gameState, playerIndex, tokenIndex);
    if (token == null) {
      System.out.println("❌ [TokenService] Token not found - Player: " + playerIndex + ", Token: " + tokenIndex);
      throw new InvalidActionException("Token not found for the given index");
    }

    if (move < 1) {
      System.out.println("❌ [TokenService] Invalid move: " + move);
      throw new InvalidActionException("Move value must be positive");
    }

    if (token.isFinished()) {
      System.out.println("❌ [TokenService] Token already finished");
      throw new InvalidActionException("Cannot move a finished token");
    }

    int currentPosition = token.getCurrentPosition();
    int newPosition = currentPosition + move;

    if (token.isOpen() && newPosition > com.example.Ludo.metadata.core.constants.ApplicationConstants.endPosition) {
      System.out.println("❌ [TokenService] Move exceeds end - New: " + newPosition + ", End: " + com.example.Ludo.metadata.core.constants.ApplicationConstants.endPosition);
      throw new InvalidActionException("Move exceeds end position for token");
    }

    // Opening token with 6
    if (!token.isOpen() && move == 6) {
      token.setCurrentPosition(1);
      System.out.println("🔓 [TokenService] Token opened - moved to position 1");
      return token;
    }

    if (!token.isOpen()) {
      System.out.println("❌ [TokenService] Token not open - need 6 to open");
      throw new InvalidActionException("Token must be opened with a 6 before moving");
    }

    token.setCurrentPosition(newPosition);

    if (newPosition == com.example.Ludo.metadata.core.constants.ApplicationConstants.endPosition) {
      System.out.println("🏁 [TokenService] Token reached finish!");
    }

    System.out.println("🚀 [TokenService] Token moved " + currentPosition + " → " + newPosition);
    return token;
  }
}
