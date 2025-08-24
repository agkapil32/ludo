import { GameStateDTO } from '../types/gameTypes';

const API_BASE_URL = 'http://localhost:8080/ludo/backend/v1';

export const ludoApi = {
  // Create a new game
  createGame: async (): Promise<GameStateDTO> => {
    const response = await fetch(`${API_BASE_URL}/createGame`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create game');
    }

    return response.json();
  },

  // Add player to a game
  addPlayer: async (gameId: string, playerName: string): Promise<GameStateDTO> => {
    const response = await fetch(`${API_BASE_URL}/addPlayer?gameId=${gameId}&playerName=${encodeURIComponent(playerName)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to add player');
    }

    return response.json();
  },

  // Start the game
  startGame: async (gameId: string): Promise<GameStateDTO> => {
    const response = await fetch(`${API_BASE_URL}/startGame?gameId=${gameId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to start game');
    }

    return response.json();
  },

  // Roll dice for a player
  rollDice: async (gameId: string, playerIndex: number): Promise<GameStateDTO> => {
    const response = await fetch(`${API_BASE_URL}/rollDice/playerIndex?gameId=${gameId}&playerIndex=${playerIndex}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to roll dice');
    }

    return response.json();
  },

  // Move token for a player
  moveToken: async (gameId: string, playerIndex: number, tokenIndex: number): Promise<GameStateDTO> => {
    const response = await fetch(`${API_BASE_URL}/moveToken/playerIndex?gameId=${gameId}&playerIndex=${playerIndex}&tokenIndex=${tokenIndex}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to move token');
    }

    return response.json();
  },

  // Get current game state
  getGameState: async (gameId: string): Promise<GameStateDTO> => {
    const response = await fetch(`${API_BASE_URL}/getGameState?gameId=${gameId}`);

    if (!response.ok) {
      throw new Error('Failed to get game state');
    }

    return response.json();
  },
};
