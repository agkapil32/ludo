// Type definitions for the Ludo game

// ✅ FIXED: DTOs that match backend exactly
export interface DiceDTO {
  move: number;      // Matches backend "move" field
  isUsed: boolean;   // Matches backend "isUsed" field
  // Convenience getters for frontend
  value?: number;    // Can be computed from move
  used?: boolean;    // Can be computed from isUsed
}

export interface PlayerDTO {
  id: string;
  name: string;
  color: string;
}

export interface TokenDTO {
  position: number;   // Matches backend TokenDTO.position
  finished: boolean;  // Matches backend TokenDTO.finished
  // Optional aliases for backward compatibility (do not rely on these)
  currentPosition?: number;
  isFinished?: boolean;
  tokenIndex?: number;
  color?: string;
  isOpen?: boolean;
  globalPosition?: number;
}

export interface LastDiceRollDTO {
  playerIndex: number;
  move: number;
  timestamp?: number;
  rollId?: string;
}

export interface GameStateDTO {
  gameId: string;
  started: boolean;
  end: boolean;
  currentPlayerId: string;
  currentPlayerIndex: number;
  players: PlayerDTO[];
  currentDiceRolls: DiceDTO[];
  winners: PlayerDTO[];
  playerPositions: Record<number, TokenDTO[]>;
  gameStatus?: string;  // Add missing field from backend
  // Display-only last dice roll (does not affect move logic)
  lastDiceRoll?: LastDiceRollDTO;
}

// ✅ REMOVED: No longer needed - backend handles all logic
// export interface RollDiceResponse {
//   gameState: GameStateDTO;
//   canRollAgain: boolean;
//   mustRollAgain: boolean;
//   turnEnded: boolean;
// }
