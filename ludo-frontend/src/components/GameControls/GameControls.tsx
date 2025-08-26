import React from 'react';
import { useGame } from '../../context/GameContext';
import Dice from '../Dice/Dice';
import './GameControls.css';

const GameControls: React.FC = () => {
  const { gameState, currentPlayerName } = useGame();

  if (!gameState) return null;

  const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentDiceRolls = gameState.currentDiceRolls || [];
  const consecutiveSixes = currentDiceRolls.filter(roll => roll.move === 6).length;

  // Determine if current user is the one whose turn it is
  const isMyTurn = currentPlayerName === currentTurnPlayer.name;

  const getGameStatusMessage = () => {
    if (gameState.end) {
      return `Game Over! Winners: ${gameState.winners.map(w => w.name).join(', ')}`;
    }

    if (consecutiveSixes === 3) {
      return `${currentTurnPlayer.name} rolled three sixes! Turn automatically moved to next player.`;
    }

    if (currentDiceRolls.length === 0) {
      if (isMyTurn) {
        return "It's your turn - Roll the dice!";
      } else {
        return `Waiting for ${currentTurnPlayer.name} to roll the dice...`;
      }
    }

    const lastRoll = currentDiceRolls[currentDiceRolls.length - 1];
    if (lastRoll.move === 6 && currentDiceRolls.length < 3) {
      if (isMyTurn) {
        return "You rolled a 6! Must roll again.";
      } else {
        return `${currentTurnPlayer.name} rolled a 6! Must roll again.`;
      }
    }

    if (isMyTurn) {
      return "You can move tokens with available dice values.";
    } else {
      return `${currentTurnPlayer.name} can move tokens with available dice values.`;
    }
  };

  return (
    <div className="game-controls">
      <div className="player-info-section">
        {/* Current User Info */}
        {currentPlayerName && (
          <div className="your-info">
            <h3>Your name: <span className="player-name">
              {currentPlayerName}
              {(() => {
                const userPlayer = gameState.players.find(p => p.name === currentPlayerName);
                return userPlayer ? ` (${userPlayer.color.toUpperCase()})` : '';
              })()}
            </span></h3>
          </div>
        )}

        {/* Current Turn Player Info */}
        <div className="current-turn-info">
          <h2>Current Player: <span className={`player-indicator ${currentTurnPlayer.color}`}>
            {currentTurnPlayer.name} ({currentTurnPlayer.color.toUpperCase()})
          </span></h2>
          {isMyTurn && <span className="your-turn-badge">YOUR TURN</span>}
        </div>
      </div>

      <div className="game-status">
        <p className="status-message">{getGameStatusMessage()}</p>
      </div>

      <Dice />

      {currentDiceRolls.length > 0 && consecutiveSixes < 3 && (
        <div className="move-instructions">
          <p>Available dice values this turn:</p>
          <p className="dice-values">
            {currentDiceRolls.map((roll, index) => (
              <span key={index} className={`dice-value ${roll.move === 6 ? 'six-value' : ''}`}>
                {roll.move}
              </span>
            ))}
          </p>
          <p className="move-note">
            {currentDiceRolls.some(roll => roll.move === 6) && currentDiceRolls.length < 3
              ? "⚠️ You have sixes - must roll again before moving!"
              : "✅ Click on your tokens to move them using these values"}
          </p>
        </div>
      )}

      {consecutiveSixes === 3 && (
        <div className="turn-skipped-warning">
          <p>⚠️ Three sixes in a row! Backend has automatically moved to the next player.</p>
        </div>
      )}
    </div>
  );
};

export default GameControls;
