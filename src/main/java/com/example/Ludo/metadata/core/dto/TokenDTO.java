package com.example.Ludo.metadata.core.dto;

public class TokenDTO {
  private int position;
  private boolean finished;

  public int getPosition() {
    return position;
  }

  public void setPosition(int position) {
    this.position = position;
  }

  public boolean isFinished() {
    return finished;
  }

  public void setFinished(boolean finished) {
    this.finished = finished;
  }
}
