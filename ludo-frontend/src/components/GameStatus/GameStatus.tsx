import React from 'react';
import { useGame } from '../../context/GameContext';
import './GameStatus.css';

const GameStatus: React.FC = () => {
  const { gameState, isRolling, currentPlayerName } = useGame();

  if (!gameState) return null;

  const currentPlayer = gameState.players?.[gameState.currentPlayerIndex];
  const diceRolls = gameState.currentDiceRolls || [];
  const consecutiveSixes = diceRolls.filter(roll => roll.move === 6).length;
  const isMyTurn = currentPlayerName === currentPlayer?.name;

  // Derive a basic game phase from available context state
  const gamePhase = gameState.end
    ? 'game-over'
    : isRolling
      ? 'rolling'
      : diceRolls.length > 0
        ? 'moving'
        : 'waiting';

  return (
    <div className={`game-status ${gamePhase}`}>
      {/* Current Turn Indicator */}
      <div className="current-turn-section">
        <h3>Current Turn</h3>
        <div className={`player-turn-indicator ${currentPlayer?.color || 'blue'} ${isMyTurn ? 'my-turn' : ''}`}>
          <div className="player-avatar">
            {currentPlayer?.name?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div className="player-info">
            <span className="player-name">{currentPlayer?.name || 'Player'}</span>
            <span className="turn-status">
              {isMyTurn ? '🎯 Your Turn' : '⏳ Playing...'}
            </span>
          </div>
        </div>
      </div>

      {/* Game Phase Indicator */}
      <div className="game-phase-section">
        <div className={`phase-indicator phase-${gamePhase}`}>
          {gamePhase === 'waiting' && '⏳ Waiting for turn'}
          {gamePhase === 'rolling' && '🎲 Rolling dice'}
          {gamePhase === 'moving' && '🚀 Moving tokens'}
          {gamePhase === 'turn-ending' && '✅ Ending turn'}
          {gamePhase === 'game-over' && '🎉 Game Over'}
        </div>
      </div>

      {/* Turn Statistics */}
      {diceRolls.length > 0 && (
        <div className="turn-stats">
          <div className="stats-item">
            <span className="stats-label">Rolls:</span>
            <span className="stats-value">{diceRolls.length}/3</span>
          </div>
          {consecutiveSixes > 0 && (
            <div className="stats-item">
              <span className="stats-label">Sixes:</span>
              <span className={`stats-value ${consecutiveSixes >= 3 ? 'critical' : 'bonus'}`}>
                {consecutiveSixes}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {isMyTurn && gamePhase === 'moving' && (
        <div className="quick-actions">
          <small>💡 Select a token to move or end your turn</small>
        </div>
      )}
    </div>
  );
};

export default GameStatus;
