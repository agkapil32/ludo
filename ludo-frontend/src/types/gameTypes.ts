// Type definitions for the Ludo game

export interface DiceDTO {
  value: number;
  // Add other dice properties as needed
}

export interface PlayerDTO {
  id: string;
  name: string;
  color: string;
  // Add other player properties as needed
}

export interface TokenDTO {
  id: string;
  position: number;
  finished: boolean; // Add finished property for completed tokens
  // Add other token properties as needed
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
}

export interface RollDiceResponse {
  gameState: GameStateDTO;
  canRollAgain: boolean;
  mustRollAgain: boolean; // true when player rolled a 6
  turnEnded: boolean; // true when three 6s were rolled
}
