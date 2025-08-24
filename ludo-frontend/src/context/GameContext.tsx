import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GameStateDTO } from '../types/gameTypes';
import { ludoApi } from '../api/ludoApi';

interface GameContextType {
  gameState: GameStateDTO | null;
  isRolling: boolean;
  currentPlayerName: string | null; // Add current player name tracking
  rollDice: () => Promise<void>;
  moveToken: (tokenIndex: number, position: number) => Promise<void>;
  setGameState: (gameState: GameStateDTO) => void;
  setCurrentPlayerName: (name: string) => void; // Add setter for current player name
  refreshGameState: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: React.ReactNode;
  gameId: string;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children, gameId }) => {
  const [gameState, setGameState] = useState<GameStateDTO | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentPlayerName, setCurrentPlayerName] = useState<string | null>(
    localStorage.getItem('currentPlayerName') // Initialize from localStorage
  );

  const refreshGameState = useCallback(async () => {
    try {
      const state = await ludoApi.getGameState(gameId);
      setGameState(state);
    } catch (error) {
      console.error('Failed to refresh game state:', error);
    }
  }, [gameId]);

  // Initialize game state when provider mounts
  useEffect(() => {
    refreshGameState();
  }, [refreshGameState]);

  // Auto-refresh game state every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshGameState();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [refreshGameState]);

  // Listen for localStorage changes to update currentPlayerName
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentPlayerName(localStorage.getItem('currentPlayerName'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const rollDice = useCallback(async () => {
    if (!gameState || isRolling) return;

    setIsRolling(true);
    try {
      const newGameState = await ludoApi.rollDice(gameId, gameState.currentPlayerIndex);
      setGameState(newGameState);
    } catch (error) {
      console.error('Failed to roll dice:', error);
    } finally {
      setIsRolling(false);
    }
  }, [gameState, isRolling, gameId]);

  const moveToken = useCallback(async (tokenIndex: number, position: number) => {
    if (!gameState) return;

    try {
      const newGameState = await ludoApi.moveToken(
        gameId,
        gameState.currentPlayerIndex,
        tokenIndex,
        position
      );
      setGameState(newGameState);
    } catch (error) {
      console.error('Failed to move token:', error);
    }
  }, [gameState, gameId]);

  const value: GameContextType = {
    gameState,
    isRolling,
    currentPlayerName, // Provide current player name
    rollDice,
    moveToken,
    setGameState,
    setCurrentPlayerName, // Provide setter for current player name
    refreshGameState,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
