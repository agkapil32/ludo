package com.example.Ludo.metadata.core.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LastDiceRoll {
  private int playerIndex;
  private int move;
  private long timestamp;
  private String rollId;
}

