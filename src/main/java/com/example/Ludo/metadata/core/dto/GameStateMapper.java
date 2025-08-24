package com.example.Ludo.metadata.core.dto;

import com.example.Ludo.metadata.core.model.Dice;
import com.example.Ludo.metadata.core.model.GameState;
import com.example.Ludo.metadata.core.model.Player;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class GameStateMapper {
  public static GameStateDTO mapToDTO(GameState game) {
    GameStateDTO dto = new GameStateDTO();
    dto.setGameId(game.getGameId());
    dto.setStarted(game.isStarted());
    dto.setEnd(game.isEnd());
    dto.setCurrentPlayerId(game.getCurrentPlayerId());
    dto.setCurrentPlayerIndex(game.getCurrentPlayerIndex());
    // Map players
    List<PlayerDTO> playerDTOs = new ArrayList<>();
    for (Player p : game.getPlayers()) {
      PlayerDTO pdto = new PlayerDTO();
      pdto.setId(p.getId());
      pdto.setName(p.getName());
      pdto.setColor(p.getColor());
      playerDTOs.add(pdto);
    }
    dto.setPlayers(playerDTOs);
    // Map dice
    List<DiceDTO> diceDTOs = new ArrayList<>();
    for (Dice d : game.getCurrentDiceRolls()) {
      DiceDTO ddto = new DiceDTO();
      ddto.setMove(d.getMove());
      ddto.setUsed(d.isUsed());
      diceDTOs.add(ddto);
    }
    dto.setCurrentDiceRolls(diceDTOs);
    // Map winners
    List<PlayerDTO> winnerDTOs = new ArrayList<>();
    for (Player p : game.getWinners()) {
      PlayerDTO pdto = new PlayerDTO();
      pdto.setId(p.getId());
      pdto.setName(p.getName());
      pdto.setColor(p.getColor());
      winnerDTOs.add(pdto);
    }
    dto.setWinners(winnerDTOs);
    // Map playerPositions
    Map<Integer, List<TokenDTO>> playerPositionsDTO =
        game.getPlayerPositions().entrySet().stream()
            .collect(
                Collectors.toMap(
                    Map.Entry::getKey,
                    e ->
                        e.getValue().stream()
                            .map(
                                token -> {
                                  TokenDTO tokenDTO = new TokenDTO();
                                  tokenDTO.setPosition(token.getCurrentPosition());
                                  tokenDTO.setFinished(token.isFinished());
                                  return tokenDTO;
                                })
                            .collect(Collectors.toList())));
    dto.setPlayerPositions(playerPositionsDTO);
    return dto;
  }
}
