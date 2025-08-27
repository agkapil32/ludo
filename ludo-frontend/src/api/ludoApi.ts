import { GameStateDTO } from '../types/gameTypes';

const API_BASE_URL = 'http://localhost:8080/ludo/backend/v1';

// Verbose API logs only when explicitly enabled via env
const DEBUG_API = (import.meta as any)?.env?.VITE_DEBUG_API === 'true';

function logApiStart(label: string, info: Record<string, unknown>) {
  if (!DEBUG_API) return;
  console.groupCollapsed(`API ▶ ${label}`);
  console.log('Request:', info);
}

function logApiEnd(label: string, result: Record<string, unknown>) {
  if (!DEBUG_API) return;
  console.log('Response:', result);
  console.groupEnd();
}

export const ludoApi = {
  // Create a new game
  createGame: async (): Promise<GameStateDTO> => {
    const url = `${API_BASE_URL}/createGame`;
    const startedAt = performance.now();
    logApiStart('GET createGame', { url });

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const durationMs = Math.round(performance.now() - startedAt);
    if (!response.ok) {
      logApiEnd('GET createGame', { status: response.status, durationMs });
      throw new Error('Failed to create game');
    }
    const data: GameStateDTO = await response.json();
    logApiEnd('GET createGame', { status: response.status, durationMs, data });
    return data;
  },

  // Add player to a game
  addPlayer: async (gameId: string, playerName: string): Promise<GameStateDTO> => {
    const url = `${API_BASE_URL}/addPlayer?gameId=${gameId}&playerName=${encodeURIComponent(playerName)}`;
    const startedAt = performance.now();
    logApiStart('POST addPlayer', { url, gameId, playerName });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const durationMs = Math.round(performance.now() - startedAt);
    if (!response.ok) {
      logApiEnd('POST addPlayer', { status: response.status, durationMs });
      throw new Error('Failed to add player');
    }
    const data: GameStateDTO = await response.json();
    logApiEnd('POST addPlayer', { status: response.status, durationMs, data });
    return data;
  },

  // Start the game
  startGame: async (gameId: string): Promise<GameStateDTO> => {
    const url = `${API_BASE_URL}/startGame?gameId=${gameId}`;
    const startedAt = performance.now();
    logApiStart('POST startGame', { url, gameId });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const durationMs = Math.round(performance.now() - startedAt);
    if (!response.ok) {
      logApiEnd('POST startGame', { status: response.status, durationMs });
      throw new Error('Failed to start game');
    }
    const data: GameStateDTO = await response.json();
    logApiEnd('POST startGame', { status: response.status, durationMs, data });
    return data;
  },

  // Roll dice for a player
  rollDice: async (gameId: string, playerIndex: number): Promise<GameStateDTO> => {
    const url = `${API_BASE_URL}/rollDice/playerIndex?gameId=${gameId}&playerIndex=${playerIndex}`;
    const startedAt = performance.now();
    logApiStart('POST rollDice', { url, gameId, playerIndex });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const durationMs = Math.round(performance.now() - startedAt);
    if (!response.ok) {
      logApiEnd('POST rollDice', { status: response.status, durationMs });
      throw new Error('Failed to roll dice');
    }
    const data: GameStateDTO = await response.json();
    logApiEnd('POST rollDice', {
      status: response.status,
      durationMs,
      summary: {
        currentPlayerIndex: data.currentPlayerIndex,
        diceCount: data.currentDiceRolls?.length ?? 0,
        lastDiceRoll: (data as any).lastDiceRoll || null,
      },
      data,
    });
    return data;
  },

  // Move token for a player
  moveToken: async (gameId: string, playerIndex: number, tokenIndex: number): Promise<GameStateDTO> => {
    const url = `${API_BASE_URL}/moveToken/playerIndex?gameId=${gameId}&playerIndex=${playerIndex}&tokenIndex=${tokenIndex}`;
    const startedAt = performance.now();
    logApiStart('POST moveToken', { url, gameId, playerIndex, tokenIndex });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const durationMs = Math.round(performance.now() - startedAt);
    if (!response.ok) {
      logApiEnd('POST moveToken', { status: response.status, durationMs });
      throw new Error('Failed to move token');
    }
    const data: GameStateDTO = await response.json();
    logApiEnd('POST moveToken', { status: response.status, durationMs, data });
    return data;
  },

  // Get current game state
  getGameState: async (gameId: string): Promise<GameStateDTO> => {
    const url = `${API_BASE_URL}/getGameState?gameId=${gameId}`;
    const startedAt = performance.now();
    logApiStart('GET getGameState', { url, gameId });

    const response = await fetch(url, { cache: 'no-store' });

    const durationMs = Math.round(performance.now() - startedAt);
    if (!response.ok) {
      logApiEnd('GET getGameState', { status: response.status, durationMs });
      throw new Error('Failed to get game state');
    }
    const data: GameStateDTO = await response.json();
    logApiEnd('GET getGameState', {
      status: response.status,
      durationMs,
      summary: {
        currentPlayerIndex: data.currentPlayerIndex,
        diceCount: data.currentDiceRolls?.length ?? 0,
        lastDiceRoll: (data as any).lastDiceRoll || null,
      },
      data,
    });
    return data;
  },
};
