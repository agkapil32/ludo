import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGameContext } from '../../context/GameContext';
import BoardSVG from './BoardSVG';
import Token from './Token';
import './Board.css';
import { getTokenPixelPosition, SAFE_GLOBAL_INDICES, logicalToGlobal, PLAYER_START_INDEX } from './boardLayout';

// Debug flag for optional UI logs - enable temporarily to diagnose client sync issues
const DEBUG_UI = true; // Temporarily enable to help debug token visibility

const Board: React.FC = () => {
  const { gameState, moveToken } = useGameContext();
  const [movingTokens, setMovingTokens] = useState<Set<string>>(new Set());
  const [tokenPreviousPositions, setTokenPreviousPositions] = useState<Map<string, number>>(new Map());
  const previousGameStateRef = useRef<any>(null);

  // ENHANCED: Get current player name for strict turn validation
  const currentPlayerName = useMemo(() => localStorage.getItem('currentPlayerName'), []);

  // ENHANCED: Stricter current player validation
  const isCurrentPlayerTurn = useMemo(() => {
    if (!gameState || !currentPlayerName) return false;
    const currentPlayer = gameState.players?.[gameState.currentPlayerIndex];
    return currentPlayer?.name === currentPlayerName;
  }, [gameState, currentPlayerName]);

  // FIX: Add game state logging to help debug client sync issues
  useEffect(() => {
    if (gameState && DEBUG_UI) {
      console.log(`🎮 [${currentPlayerName}] Game State Update:`, {
        gameId: gameState.gameId,
        currentPlayerIndex: gameState.currentPlayerIndex,
        currentPlayerName,
        isMyTurn: isCurrentPlayerTurn,
        players: gameState.players?.map((p, i) => ({
          index: i,
          name: p.name,
          color: p.color,
          tokens: gameState.playerPositions?.[i] || []
        })),
        playerPositions: gameState.playerPositions
      });
    }
  }, [gameState, currentPlayerName, isCurrentPlayerTurn]);

  // Track position changes for animations
  useEffect(() => {
    if (gameState && previousGameStateRef.current) {
      const newPreviousPositions = new Map<string, number>();

      gameState.players?.forEach((player, playerIndex) => {
        const playerTokens = gameState.playerPositions?.[playerIndex] || [];
        const prevPlayerTokens = previousGameStateRef.current.playerPositions?.[playerIndex] || [];

        playerTokens.forEach((token: any, tokenIndex: number) => {
          const tokenKey = `${playerIndex}-${tokenIndex}`;
          const prevToken = prevPlayerTokens[tokenIndex];

          if (prevToken && prevToken.position !== token.position) {
            newPreviousPositions.set(tokenKey, prevToken.position);
          }
        });
      });

      setTokenPreviousPositions(newPreviousPositions);
    }

    previousGameStateRef.current = gameState;
  }, [gameState]);

  // Add cleanup function for token animations
  useEffect(() => {
    // Expose cleanup function globally for token components to use
    window.boardCleanupMovingToken = (tokenKey: string) => {
      setMovingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(tokenKey);
        return newSet;
      });
    };

    // Cleanup on unmount
    return () => {
      delete window.boardCleanupMovingToken;
    };
  }, []);

  // Better error handling and loading states
  if (!gameState) {
    return (
      <div className="board-container">
        <div className="board-loading">
          <div className="loading-spinner"></div>
          <p>Loading game board...</p>
        </div>
      </div>
    );
  }

  // Debug: Log current game state
  if (DEBUG_UI) {
    console.log('🎮 Current Game State:', {
      gameId: gameState.gameId,
      started: gameState.started,
      currentPlayerIndex: gameState.currentPlayerIndex,
      players: gameState.players?.map(p => ({ name: p.name, color: p.color })),
      currentDiceRolls: gameState.currentDiceRolls,
      playerPositions: gameState.playerPositions
    });
  }

  // Safety check for players array
  if (!gameState.players || gameState.players.length === 0) {
    return (
      <div className="board-container">
        <div className="board-error">
          <h3>⚠️ No players found</h3>
          <p>Waiting for players to join the game...</p>
        </div>
      </div>
    );
  }

  // Helper function to get token component index based on player color
  const getPlayerTokenIndex = (playerColor: string): number => {
    const colorMap: Record<string, number> = {
      'RED': 0,
      'GREEN': 1,
      'BLUE': 2,
      'YELLOW': 3
    };
    return colorMap[playerColor.toUpperCase()] || 0;
  };

  // ENHANCED: Sequential dice usage - ensure strict order (6, 6, 2 etc.)
  const getNextUsableDice = (rolls: any[]): any | null => {
    // Find the FIRST unused dice to maintain sequential order
    return rolls.find(dice => !dice.isUsed) || null;
  };

  // ENHANCED: Improved function to check if a token can be moved with stricter validation
  const canMoveToken = (playerIndex: number, tokenIndex: number, token: any): boolean => {
    try {
      // CRITICAL: Only current player can move tokens
      if (!isCurrentPlayerTurn || gameState.currentPlayerIndex !== playerIndex) {
        return false;
      }

      const rolls = gameState.currentDiceRolls || [];
      const nextDice = getNextUsableDice(rolls);
      const tokenFinished = !!token.finished;

      // Quick early returns to prevent unnecessary calculations
      if (!nextDice || tokenFinished) {
        return false;
      }

      const isOpen = token.position >= 0;
      if (isOpen) {
        // Check if token can move forward without overshooting
        // Use the NEXT unused dice (sequential order)
        const newPosition = token.position + nextDice.move;
        const canMove = newPosition <= 56; // Max position including home stretch
        return canMove;
      }

      // Token at home: allow only if the next unused dice is a six
      return nextDice.move === 6;
    } catch (error) {
      console.error('Error checking if token can move:', error);
      return false;
    }
  };

  // Check if a position is safe from being cut
  const isPositionSafe = (playerIndex: number, position: number): boolean => {
    if (position < 0 || position >= 50) return true; // Home yard and home stretch are safe
    const globalIndex = logicalToGlobal(PLAYER_START_INDEX[playerIndex], position);
    return SAFE_GLOBAL_INDICES.has(globalIndex);
  };

  // Get valid moves for a token
  const getValidMoves = (playerIndex: number, tokenIndex: number, token: any): number[] => {
    const rolls = gameState.currentDiceRolls || [];
    const validMoves: number[] = [];

    if (!canMoveToken(playerIndex, tokenIndex, token)) {
      return validMoves;
    }

    rolls.forEach(dice => {
      if (!dice.isUsed) {
        if (token.position === -1) {
          // Token at home - can only move with 6, and goes to position 0
          if (dice.move === 6) {
            validMoves.push(0); // Move to start position (matches backend)
          }
        } else {
          // Token on board - normal movement
          const newPosition = token.position + dice.move;
          if (newPosition <= 56) { // Within bounds including home stretch
            validMoves.push(newPosition);
          }
        }
      }
    });

    return validMoves;
  };

  // Precompute overlapping tokens by pixel position to provide stack indices
  const overlapCounts: Map<string, number> = new Map();
  const overlapIndices: Map<string, number> = new Map();

  try {
    // First pass: count how many tokens occupy the same pixel position
    gameState.players.forEach((player, playerIdx) => {
      // CRITICAL FIX: Use actual playerIdx from game state, not color mapping
      // This ensures tokens appear in correct positions regardless of color assignment
      const playerTokens = gameState.playerPositions && gameState.playerPositions[playerIdx]
        ? gameState.playerPositions[playerIdx]
        : Array.from({ length: 4 }, () => ({ position: -1, finished: false }));

      playerTokens.forEach((token: any, tokenIdx: number) => {
        // FIXED: Use playerIdx directly - this maintains consistency with game state
        const { x, y } = getTokenPixelPosition(playerIdx, tokenIdx, token.position);
        const key = `${Math.round(x)}:${Math.round(y)}`;
        overlapCounts.set(key, (overlapCounts.get(key) || 0) + 1);
      });
    });
  } catch (e) {
    console.warn('Failed to precompute token overlaps:', e);
  }

  // ENHANCED: Token click handler with sequential dice validation and proper GameStateDTO sync
  const handleTokenClick = async (playerIndex: number, tokenIndex: number, token: any) => {
    // CRITICAL: Verify it's current player's turn
    if (!isCurrentPlayerTurn || gameState.currentPlayerIndex !== playerIndex) {
      return;
    }

    const rolls = gameState.currentDiceRolls || [];
    const nextDice = getNextUsableDice(rolls);

    if (!nextDice) {
      console.warn('No unused dice available for sequential use');
      return;
    }

    if (!canMoveToken(playerIndex, tokenIndex, token)) {
      console.warn('Token cannot be moved with current dice state');
      return;
    }

    try {
      // Mark token as moving for animation state
      const tokenKey = `${playerIndex}-${tokenIndex}`;
      setMovingTokens(prev => new Set(prev).add(tokenKey));

      // Store current position for animation reference
      setTokenPreviousPositions(prev => new Map(prev).set(tokenKey, token.position));

      // Use existing moveToken function - it expects only tokenIndex and handles backend sync
      await moveToken(tokenIndex);

      // The GameContext.moveToken will update gameState from backend response
      // This ensures UI stays in sync with backend GameStateDTO

    } catch (error) {
      console.error('Failed to move token:', error);
      // Remove from moving state on error
      setMovingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${playerIndex}-${tokenIndex}`);
        return newSet;
      });
    }

    // Note: We don't manually clean up moving state here anymore
    // The position change detection in useEffect will handle animation completion
  };

  try {
    return (
      <div className="board-container">
        <svg width="600" height="600" viewBox="0 0 600 600" className="game-board">
          {/* Render the board background */}
          <BoardSVG size={600} />

          {/* Render player tokens */}
          {gameState.players && gameState.players.map((player, playerIndex) => {
            if (DEBUG_UI) {
              console.debug(`🎮 Player ${playerIndex} (${player.color}) - Game State Index: ${playerIndex}`);
            }

            const playerTokens = gameState.playerPositions && gameState.playerPositions[playerIndex]
              ? gameState.playerPositions[playerIndex]
              : Array.from({length: 4}, () => ({ position: -1, finished: false }));

            if (DEBUG_UI) {
              console.debug(`🎯 Player ${playerIndex} tokens:`, playerTokens.map(t => t.position));
            }

            // FIXED: Use actual playerIndex from game state, not color mapping
            // This ensures tokens appear in correct home positions for each player
            return playerTokens.map((token, tokenIndex) => {
              try {
                if (DEBUG_UI) {
                  console.debug(`🔍 Rendering token - Player: ${playerIndex}, Token: ${tokenIndex}, Position: ${token.position}, Color: ${player.color}`);
                }

                const tokenKey = `${playerIndex}-${tokenIndex}`;

                // Determine if token should have special effects
                const isMovableToken = canMoveToken(playerIndex, tokenIndex, token);
                const isCurrentlyMoving = movingTokens.has(tokenKey);
                const previousPosition = tokenPreviousPositions.get(tokenKey);
                const isOnSafePosition = isPositionSafe(playerIndex, token.position);

                // FIXED: Use actual playerIndex for positioning (not mapped index)
                const { x, y } = getTokenPixelPosition(playerIndex, tokenIndex, token.position);
                const key = `${Math.round(x)}:${Math.round(y)}`;
                const stackCount = overlapCounts.get(key) || 1;
                const currentIdx = overlapIndices.get(key) || 0;
                overlapIndices.set(key, currentIdx + 1);

                return (
                  <Token
                    key={`player-${playerIndex}-token-${tokenIndex}`}
                    color={player.color}
                    position={token.position}
                    tokenIndex={tokenIndex}
                    playerIndex={playerIndex} // FIXED: Use actual playerIndex, not mapped
                    isFinished={token.finished}
                    isGlowing={gameState.currentPlayerIndex === playerIndex || token.finished || isOnSafePosition}
                    isAnimated={isMovableToken}
                    onClick={isMovableToken ? () => handleTokenClick(playerIndex, tokenIndex, token) : undefined}
                    stackIndex={currentIdx}
                    stackCount={stackCount}
                    isDimmed={!isMovableToken && gameState.currentPlayerIndex === playerIndex}
                    isMoving={isCurrentlyMoving}
                    canMove={isMovableToken}
                    previousPosition={previousPosition}
                    isCurrentPlayer={gameState.currentPlayerIndex === playerIndex}
                  />
                );
              } catch (tokenError) {
                console.error(`❌ Error rendering token for player ${playerIndex}, token ${tokenIndex}:`, tokenError);
                return null;
              }
            });
          })}
        </svg>
      </div>
    );
  } catch (error) {
    console.error('Critical error in Board component:', error);
    return (
      <div className="board-container">
        <div className="board-error">
          <h3>⚠️ Board Rendering Error</h3>
          <p>There was an issue loading the game board. Please refresh the page.</p>
          <button onClick={() => window.location.reload()} className="refresh-button">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default Board;
