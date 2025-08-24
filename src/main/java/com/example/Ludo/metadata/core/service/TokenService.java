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
    if (token == null) throw new InvalidActionException("Token not found for the given index");
    if (move < 1) throw new InvalidActionException("Move value must be positive");
    if (token.isFinished()) throw new InvalidActionException("Cannot move a finished token");
    int newPosition = token.getCurrentPosition() + move;

    if (token.isOpen()
        && newPosition
            > com.example.Ludo.metadata.core.constants.ApplicationConstants.endPosition) {
      throw new InvalidActionException("Move exceeds end position for token");
    }

    if (!token.isOpen() && move == 6) {
      token.setCurrentPosition(1);
      return token;
    }

    if (!token.isOpen()) {
      throw new InvalidActionException("Token must be opened with a 6 before moving");
    }
    token.setCurrentPosition(newPosition);
    return token;
  }
}
