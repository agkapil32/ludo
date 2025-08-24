import React from 'react';
import { useGame } from '../../context/GameContext';
import BoardSVG from './BoardSVG';
import Token from './Token';
import './Board.css';

const Board: React.FC = () => {
  const { gameState } = useGame();

  if (!gameState) {
    return (
      <div className="board-container">
        <div className="board-placeholder">
          <p>Loading board...</p>
        </div>
      </div>
    );
  }

  // Debug: Log token data to console
  console.log('Game State:', gameState);
  console.log('Player Positions:', gameState.playerPositions);

  return (
    <div className="board-container">
      <div className="ludo-board-wrapper">
        <BoardSVG size={600} />

        {/* Render tokens on the board */}
        {gameState.players.map((player, playerIndex) => {
          // If playerPositions exists, use it; otherwise create default tokens at home
          const playerTokens = gameState.playerPositions && gameState.playerPositions[playerIndex]
            ? gameState.playerPositions[playerIndex]
            : Array.from({length: 4}, (_, tokenIndex) => ({
                id: `${player.id}-token-${tokenIndex}`,
                position: -1, // Home position
                finished: false
              }));

          return playerTokens.map((token, tokenIndex) => {
            console.log(`Rendering token for Player ${playerIndex + 1}, Token ${tokenIndex + 1}, Position: ${token.position}`);
            return (
              <Token
                key={`${player.id}-${tokenIndex}`}
                color={player.color}
                position={token.position}
                tokenIndex={tokenIndex}
                playerIndex={playerIndex}
                isFinished={token.finished}
              />
            );
          });
        })}

        {/* Current dice display */}
        {gameState.currentDiceRolls && gameState.currentDiceRolls.length > 0 && (
          <div className="board-dice-overlay">
            <div className="dice-display">
              {gameState.currentDiceRolls.map((roll, index) => (
                <div key={index} className={`dice-value ${roll.value === 6 ? 'six' : ''}`}>
                  {roll.value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;
