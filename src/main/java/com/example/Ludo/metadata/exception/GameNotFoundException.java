package com.example.Ludo.metadata.exception;

public class GameNotFoundException extends RuntimeException {
  public GameNotFoundException(String message) {
    super(message);
  }

  public GameNotFoundException(String message, Exception e) {
    super(message, e);
  }
}
