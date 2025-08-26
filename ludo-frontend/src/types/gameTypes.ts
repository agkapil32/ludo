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
  tokenIndex: number;        // Matches backend
  currentPosition: number;   // Matches backend
  color: string;            // Matches backend
  // Computed properties (derived from backend data)
  isOpen?: boolean;         // Computed: currentPosition !== -1
  isFinished?: boolean;     // Computed: backend calculates this
  globalPosition?: number;  // Computed: backend calculates this
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
}

// ✅ REMOVED: No longer needed - backend handles all logic
// export interface RollDiceResponse {
//   gameState: GameStateDTO;
//   canRollAgain: boolean;
//   mustRollAgain: boolean;
//   turnEnded: boolean;
// }
