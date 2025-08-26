import React from 'react';
import { useGameContext } from '../../context/GameContext';
import BoardSVG from './BoardSVG';
import Token from './Token';
import './Board.css';

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
      const tokenCanMove = token.currentPosition >= 0 && !token.isFinished;

      return isCurrentPlayerTurn && hasValidDiceRolls && tokenCanMove;
    } catch (error) {
      console.error('Error checking if token can move:', error);
      return false;
    }
  };

  // Handle token click for movement
  const handleTokenClick = async (playerIndex: number, tokenIndex: number, token: any) => {
    console.log(`🎯 Token clicked: Player ${playerIndex}, Token ${tokenIndex}, Position: ${token.currentPosition}`);

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
            console.log(`Player ${playerIndex + 1} (${player.color}):`, player);

            const playerTokens = gameState.playerPositions && gameState.playerPositions[playerIndex]
              ? gameState.playerPositions[playerIndex]
              : Array.from({length: 4}, () => ({ currentPosition: -1, isFinished: false }));

            console.log(`Player ${playerIndex + 1} tokens:`, playerTokens);

            return playerTokens.map((token, tokenIndex) => {
              try {
                console.log(`Rendering token for Player ${playerIndex + 1} (${player.color}), Token ${tokenIndex + 1}, Position: ${token.currentPosition}`);

                // Determine if token should have special effects
                const isCurrentPlayerTurn = gameState.currentPlayerIndex === playerIndex;
                const isMovableToken = canMoveToken(playerIndex, tokenIndex, token);

                return (
                  <Token
                    key={`player-${playerIndex}-token-${tokenIndex}`}
                    color={player.color} // Use actual player color from game state
                    position={token.currentPosition} // Use currentPosition from backend
                    tokenIndex={tokenIndex}
                    playerIndex={getPlayerTokenIndex(player.color)} // Map color to token component index
                    isFinished={token.isFinished}
                    isGlowing={isCurrentPlayerTurn || token.isFinished}
                    isAnimated={isMovableToken}
                    onClick={isMovableToken ? () => handleTokenClick(playerIndex, tokenIndex, token) : undefined}
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
