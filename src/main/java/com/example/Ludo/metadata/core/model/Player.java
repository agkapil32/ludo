package com.example.Ludo.metadata.core.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
// @NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {
  private final String id;
  private String name;
  private String color; // not default, will be assigned when join the game
}
