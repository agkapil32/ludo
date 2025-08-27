import React from 'react';
import { useGameContext } from '../../context/GameContext';
import BoardSVG from './BoardSVG';
import Token from './Token';
import './Board.css';
import { getTokenPixelPosition } from './boardLayout';

// Debug flag for optional UI logs
const DEBUG_UI = (import.meta as any)?.env?.VITE_DEBUG_UI === 'true';

const Board: React.FC = () => {
  const { gameState, moveToken } = useGameContext();

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

  // Helper function to check if a token can be moved
  const canMoveToken = (playerIndex: number, tokenIndex: number, token: any): boolean => {
    try {
      const isCurrentPlayerTurn = gameState.currentPlayerIndex === playerIndex;
      const hasValidDiceRolls = gameState.currentDiceRolls && gameState.currentDiceRolls.some(dice => !dice.isUsed);
      const tokenCanMove = token.position >= 0 && !token.finished;

      return isCurrentPlayerTurn && hasValidDiceRolls && tokenCanMove;
    } catch (error) {
      console.error('Error checking if token can move:', error);
      return false;
    }
  };

  // Precompute overlapping tokens by pixel position to provide stack indices
  const overlapCounts: Map<string, number> = new Map();
  const overlapIndices: Map<string, number> = new Map();

  try {
    // First pass: count how many tokens occupy the same pixel position
    gameState.players.forEach((player, playerIdx) => {
      const mappedPlayerIndex = getPlayerTokenIndex(player.color);
      const playerTokens = gameState.playerPositions && gameState.playerPositions[playerIdx]
        ? gameState.playerPositions[playerIdx]
        : Array.from({ length: 4 }, () => ({ position: -1, finished: false }));

      playerTokens.forEach((token: any, tokenIdx: number) => {
        const { x, y } = getTokenPixelPosition(mappedPlayerIndex, tokenIdx, token.position);
        const key = `${Math.round(x)}:${Math.round(y)}`;
        overlapCounts.set(key, (overlapCounts.get(key) || 0) + 1);
      });
    });
  } catch (e) {
    console.warn('Failed to precompute token overlaps:', e);
  }

  // Handle token click for movement
  const handleTokenClick = async (playerIndex: number, tokenIndex: number, token: any) => {
    if (DEBUG_UI) {
      console.debug(`Token click: p${playerIndex} #${tokenIndex} pos=${token.position}`);
    }

    try {
      if (!canMoveToken(playerIndex, tokenIndex, token)) {
        console.log('❌ Token cannot be moved');
        return;
      }

      // Use the first available dice roll (selection logic handled by backend)
      const availableDice = gameState.currentDiceRolls?.find(dice => !dice.isUsed);
      if (availableDice) {
        await moveToken(tokenIndex);
        console.log(`✅ Token move requested. Using available dice value (server-side): ${availableDice.move}`);
      }
    } catch (error) {
      console.error('❌ Failed to move token:', error);
    }
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
              console.debug(`Player ${playerIndex + 1} (${player.color})`);
            }

            const playerTokens = gameState.playerPositions && gameState.playerPositions[playerIndex]
              ? gameState.playerPositions[playerIndex]
              : Array.from({length: 4}, () => ({ position: -1, finished: false }));

            if (DEBUG_UI) {
              console.debug(`p${playerIndex + 1} tokens:`, playerTokens);
            }

            const mappedPlayerIndex = getPlayerTokenIndex(player.color);

            return playerTokens.map((token, tokenIndex) => {
              try {
                if (DEBUG_UI) {
                  console.debug(`Render token p${playerIndex + 1} t${tokenIndex + 1} pos=${token.position}`);
                }

                // Determine if token should have special effects
                const isMovableToken = canMoveToken(playerIndex, tokenIndex, token);

                // Compute stack info using precomputed counts and running indices per key
                const { x, y } = getTokenPixelPosition(mappedPlayerIndex, tokenIndex, token.position);
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
                    playerIndex={mappedPlayerIndex}
                    isFinished={token.finished}
                    isGlowing={gameState.currentPlayerIndex === playerIndex || token.finished}
                    isAnimated={isMovableToken}
                    onClick={isMovableToken ? () => handleTokenClick(playerIndex, tokenIndex, token) : undefined}
                    stackIndex={currentIdx}
                    stackCount={stackCount}
                    isDimmed={!isMovableToken}
                  />
                );
              } catch (tokenError) {
                console.error(`Error rendering token for player ${playerIndex}, token ${tokenIndex}:`, tokenError);
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
