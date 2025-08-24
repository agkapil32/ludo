import React from 'react';
import { useGame } from '../../context/GameContext';
import './PlayerList.css';

const PlayerList: React.FC = () => {
  const { gameState } = useGame();

  if (!gameState) return null;

  return (
    <div className="player-list">
      <h3>Players ({gameState.players.length}/4)</h3>
      <div className="players">
        {gameState.players.map((player, index) => (
          <div
            key={player.id}
            className={`player-card ${gameState.currentPlayerIndex === index ? 'current' : ''}`}
          >
            <div className={`player-color ${player.color}`}></div>
            <div className="player-info">
              <span className="player-name">
                {player.name} ({player.color.toUpperCase()})
              </span>
              {gameState.currentPlayerIndex === index && (
                <span className="current-turn">🎯 Current Turn</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!gameState.started && gameState.players.length < 4 && (
        <div className="waiting-message">
          <p>Waiting for more players...</p>
          <p className="game-id">Share Game ID: <strong>{gameState.gameId}</strong></p>
        </div>
      )}
    </div>
  );
};

export default PlayerList;
