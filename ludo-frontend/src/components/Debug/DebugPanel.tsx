import React from 'react';
import { useGameContext } from '../../context/GameContext';

const DebugPanel: React.FC = () => {
  const { gameState, currentPlayerName, forceRefresh } = useGameContext();

  if (!gameState) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>
        🔍 Debug Panel - {currentPlayerName}
      </h4>

      <div style={{ marginBottom: '10px' }}>
        <strong>Game ID:</strong> {gameState.gameId}<br/>
        <strong>Current Turn:</strong> Player {gameState.currentPlayerIndex + 1}<br/>
        <strong>Started:</strong> {gameState.started ? 'Yes' : 'No'}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Players:</strong>
        {gameState.players?.map((player, index) => (
          <div key={index} style={{ marginLeft: '10px' }}>
            {index}: {player.name} ({player.color})
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Token Positions:</strong>
        {gameState.playerPositions?.map((playerTokens, playerIndex) => (
          <div key={playerIndex} style={{ marginLeft: '10px' }}>
            P{playerIndex + 1}: {playerTokens.map(t => t.position).join(', ')}
          </div>
        ))}
      </div>

      <button
        onClick={forceRefresh}
        style={{
          background: '#2196F3',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        🔄 Force Refresh
      </button>
    </div>
  );
};

export default DebugPanel;
