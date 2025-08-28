import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GameStateDTO } from '../types/gameTypes';
import { ludoApi } from '../api/ludoApi';

interface GameContextType {
  gameState: GameStateDTO | null;
  isRolling: boolean;  // ✅ KEEP: UI state for loading indicator
  currentPlayerName: string | null;  // ✅ KEEP: Client-side preference
  rollDice: () => Promise<void>;
  moveToken: (tokenIndex: number) => Promise<void>; // removed position arg for API consistency
  startGame: () => Promise<void>; // new: start game via API
  setGameState: (gameState: GameStateDTO) => void;
  setCurrentPlayerName: (name: string) => void;
  refreshGameState: () => Promise<void>;
  forceRefresh: () => Promise<void>; // ADDED: Manual refresh function
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Add alias for useGameContext to maintain compatibility
export const useGameContext = useGame;

interface GameProviderProps {
  children: React.ReactNode;
  gameId: string;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children, gameId }) => {
  const [gameState, setGameState] = useState<GameStateDTO | null>(null);
  const [isRolling, setIsRolling] = useState(false);  // ✅ KEEP: UI loading state
  const [currentPlayerName, setCurrentPlayerName] = useState<string | null>(
    localStorage.getItem('currentPlayerName')
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

  // Auto-refresh game state every 5 seconds (reduced from 10 for better sync)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(`🔄 [Auto-refresh] Refreshing game state for ${currentPlayerName}`);
      refreshGameState();
    }, 5000); // Reduced to 5 seconds for better synchronization

    return () => clearInterval(interval);
  }, [refreshGameState, currentPlayerName]);

  // ENHANCED: Add manual refresh function for debugging
  const forceRefresh = useCallback(async () => {
    console.log(`🔄 [Force-refresh] Manual refresh triggered by ${currentPlayerName}`);
    await refreshGameState();
  }, [refreshGameState, currentPlayerName]);

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

    const isMyTurn = gameState && currentPlayerName
      ? gameState.players[gameState.currentPlayerIndex]?.name === currentPlayerName
      : false;

    if (!isMyTurn) {
      alert('❌ It\'s not your turn! Wait for your turn to roll the dice.');
      return;
    }

    console.log('🎯 GameContext: Starting dice roll for player index:', gameState.currentPlayerIndex);
    setIsRolling(true);
    try {
      const newGameState = await ludoApi.rollDice(gameId, gameState.currentPlayerIndex);
      console.log('✅ GameContext: Received new game state from API, dice rolls:', newGameState.currentDiceRolls);
      setGameState(newGameState);
    } catch (error) {
      console.error('❌ GameContext: Failed to roll dice:', error);
      let errorMessage = 'Failed to roll dice';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`❌ Cannot Roll Dice: ${errorMessage}`);
    } finally {
      setIsRolling(false);
      console.log('🔄 GameContext: Roll dice operation completed, isRolling set to false');
    }
  }, [gameState, isRolling, gameId, currentPlayerName]);

  const moveToken = useCallback(async (tokenIndex: number) => {
    if (!gameState) return;

    try {
      const newGameState = await ludoApi.moveToken(gameId, gameState.currentPlayerIndex, tokenIndex);
      setGameState(newGameState);
    } catch (error) {
      console.error('Failed to move token:', error);
      throw error;
    }
  }, [gameState, gameId]);

  const startGame = useCallback(async () => {
    try {
      const updatedState = await ludoApi.startGame(gameId);
      setGameState(updatedState);
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game. Please try again.');
    }
  }, [gameId]);

  const value: GameContextType = {
    gameState,
    isRolling,
    currentPlayerName,
    rollDice,
    moveToken,
    startGame,
    setGameState,
    setCurrentPlayerName: (name: string) => {
      setCurrentPlayerName(name);
      localStorage.setItem('currentPlayerName', name);
    },
    refreshGameState,
    forceRefresh  // ADDED: Expose manual refresh function
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
