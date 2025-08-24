package com.example.Ludo.metadata.core.constants;

import java.util.*;

public class ApplicationConstants {
  public static final int endPosition = 57;
  public static final int firePosition = 56;
  public static final HashSet<Integer> SafeCells =
      new HashSet<>(Arrays.asList(0, 8, 13, 21, 26, 34, 39, 47));
  public static final List<String> colors = Arrays.asList("GREEN", "BLUE", "RED", "YELLOW");
  public static final int maxPlayersFour = 4;
}
