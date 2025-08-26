import React from 'react';
import { getTokenPixelPosition } from './boardLayout';

interface TokenProps {
  color: string;
  position: number;
  tokenIndex: number;
  playerIndex: number;
  isFinished?: boolean;
  isAnimated?: boolean;
  isGlowing?: boolean;
  onClick?: () => void;
}

const Token: React.FC<TokenProps> = ({
  color,
  position,
  tokenIndex,
  playerIndex,
  isFinished = false,
  isAnimated = false,
  isGlowing = false,
  onClick
}) => {
  const pixelPosition = getTokenPixelPosition(playerIndex, tokenIndex, position);
  const tokenSize = 24; // Size of the token
  const tokenRadius = tokenSize / 2;

  // Get color based on playerIndex for consistent mapping
  const getTokenColor = () => {
    switch (playerIndex) {
      case 0: return '#FF0000'; // 🟥 Red
      case 1: return '#00A550'; // 🟩 Green (darker, nicer green)
      case 2: return '#0000FF'; // 🟦 Blue
      case 3: return '#FFD700'; // 🟨 Yellow (golden yellow)
      default: return '#FF0000'; // Default red
    }
  };

  const tokenColor = getTokenColor();
  const tokenId = `token-${playerIndex}-${tokenIndex}-${Math.random().toString(36).substr(2, 9)}`;

  console.log(`Rendering token at position: x=${pixelPosition.x}, y=${pixelPosition.y}, color=${color}, playerIndex=${playerIndex}`);

  return (
    <g
      className={`token-wrapper token-player-${playerIndex} ${isFinished ? 'finished-token' : ''} ${isGlowing ? 'glowing' : ''} ${isAnimated ? 'animated' : ''}`}
      transform={`translate(${pixelPosition.x}, ${pixelPosition.y})`}
      title={`Player ${playerIndex + 1} Token ${tokenIndex + 1} - Position: ${position}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <defs>
        {/* Main gradient for the token */}
        <radialGradient id={`${tokenId}-main`} cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor={tokenColor} stopOpacity="0.9" />
          <stop offset="40%" stopColor={tokenColor} stopOpacity="1" />
          <stop offset="80%" stopColor={tokenColor} stopOpacity="1" />
          <stop offset="100%" stopColor={tokenColor} stopOpacity="0.8" />
        </radialGradient>

        {/* Glossy highlight gradient */}
        <radialGradient id={`${tokenId}-highlight`} cx="0.3" cy="0.2" r="0.4">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Shadow filter */}
        <filter id={`${tokenId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.4)" />
        </filter>
      </defs>

      {/* Drop shadow */}
      <ellipse
        cx="0"
        cy="3"
        rx={tokenRadius * 0.9}
        ry="2"
        fill="rgba(0,0,0,0.3)"
        opacity="0.6"
      />

      {/* Main token body */}
      <circle
        cx="0"
        cy="0"
        r={tokenRadius}
        fill={`url(#${tokenId}-main)`}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="1"
        filter={`url(#${tokenId}-shadow)`}
      />

      {/* Inner border */}
      <circle
        cx="0"
        cy="0"
        r={tokenRadius * 0.85}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.5"
      />

      {/* Glossy highlight */}
      <ellipse
        cx="-2"
        cy="-3"
        rx={tokenRadius * 0.5}
        ry={tokenRadius * 0.3}
        fill={`url(#${tokenId}-highlight)`}
      />

      {/* Small center highlight */}
      <circle
        cx="-1"
        cy="-2"
        r="2"
        fill="rgba(255,255,255,0.6)"
      />
    </g>
  );
};

export default Token;
