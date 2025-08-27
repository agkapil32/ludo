package com.example.Ludo.metadata.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LastDiceRollDTO {
  private int playerIndex;
  private int move;
  private long timestamp;
  private String rollId;
}

