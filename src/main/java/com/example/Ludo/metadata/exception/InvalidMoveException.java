package com.example.Ludo.metadata.exception;

public class InvalidMoveException extends InvalidActionException {
  public InvalidMoveException(String message) {
    super(message);
  }

  public InvalidMoveException(String message, Throwable cause) {
    super(message, cause);
  }
}
