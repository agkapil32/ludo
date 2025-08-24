import React from 'react';
import { getTokenPixelPosition } from './boardLayout';

interface TokenProps {
  color: string;
  position: number; // Board position (-1 for home, 0-51 for board positions)
  tokenIndex: number;
  playerIndex: number;
  isFinished: boolean;
}

const Token: React.FC<TokenProps> = ({ color, position, tokenIndex, playerIndex, isFinished }) => {
  // Get pixel coordinates based on position
  const pixelPosition = getTokenPixelPosition(playerIndex, tokenIndex, position);

  return (
    <div
      className={`token ${color} ${position === -1 ? 'home' : ''} ${isFinished ? 'finished' : ''}`}
      style={{
        left: pixelPosition.x,
        top: pixelPosition.y,
        transform: 'translate(-50%, -50%)',
      }}
      title={`Player ${playerIndex + 1} Token ${tokenIndex + 1} - Position: ${position}`} // Debug tooltip
    >
      {/* Show token number for better visibility */}
      <span style={{
        fontSize: '10px',
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '1px 1px 1px rgba(0,0,0,0.8)'
      }}>
        {tokenIndex + 1}
      </span>
    </div>
  );
};

export default Token;
