import React, { useRef, useMemo } from 'react';
import { getTokenPixelPosition, PLAYER_START_INDEX, logicalToGlobal, SAFE_GLOBAL_INDICES } from './boardLayout';

// Debug flag for optional UI logs
const DEBUG_UI = (import.meta as any)?.env?.VITE_DEBUG_UI === 'true';

interface TokenProps {
  color: string;
  position: number;
  tokenIndex: number;
  playerIndex: number;
  isFinished?: boolean;
  isAnimated?: boolean;
  isGlowing?: boolean;
  onClick?: () => void;
  // New: stacking info to avoid overlap
  stackIndex?: number;
  stackCount?: number;
  // New: visual dimming when not interactive
  isDimmed?: boolean;
}

const Token: React.FC<TokenProps> = ({
  color,
  position,
  tokenIndex,
  playerIndex,
  isFinished = false,
  isAnimated = false,
  isGlowing = false,
  onClick,
  stackIndex = 0,
  stackCount = 1,
  isDimmed = false
}) => {
  const basePos = getTokenPixelPosition(playerIndex, tokenIndex, position);
  const tokenSize = 24; // Size of the token
  const tokenRadius = tokenSize / 2;

  // Compute stacking offset pattern to avoid exact overlap
  const calcStackOffset = (idx: number, count: number) => {
    const d = 7; // grid offset distance
    if (count <= 1) return { dx: 0, dy: 0 };
    if (count === 2) return [{ dx: -d, dy: 0 }, { dx: d, dy: 0 }][idx] || { dx: 0, dy: 0 };
    if (count === 3) return [{ dx: 0, dy: -d }, { dx: -d, dy: d }, { dx: d, dy: d }][idx] || { dx: 0, dy: 0 };
    if (count === 4) return [
      { dx: -d, dy: -d }, { dx: d, dy: -d }, { dx: -d, dy: d }, { dx: d, dy: d }
    ][idx] || { dx: 0, dy: 0 };
    // 5 or more: distribute around a small circle
    const r = 9;
    const angle = (2 * Math.PI * idx) / count;
    return { dx: Math.round(r * Math.cos(angle)), dy: Math.round(r * Math.sin(angle)) };
  };

  const { dx, dy } = calcStackOffset(stackIndex, stackCount);
  const pixelPosition = { x: basePos.x + dx, y: basePos.y + dy };

  // Get color based on playerIndex for consistent mapping
  const getTokenColor = () => {
    switch (playerIndex) {
      case 0: return '#FF0000'; // Red
      case 1: return '#00A550'; // Green
      case 2: return '#0000FF'; // Blue
      case 3: return '#FFD700'; // Yellow
      default: return '#FF0000';
    }
  };

  const tokenColor = getTokenColor();

  // Stable ID per component instance
  const idRef = useRef(Math.random().toString(36).substr(2, 9));
  const tokenId = useMemo(() => `token-${playerIndex}-${tokenIndex}-${idRef.current}`, [playerIndex, tokenIndex]);

  // Determine if current position is a safe cell on the main track
  const isOnSafeCell = useMemo(() => {
    if (position < 0 || position >= 50) return false; // ignore home yard and home stretch
    const globalIndex = logicalToGlobal(PLAYER_START_INDEX[playerIndex], position);
    return SAFE_GLOBAL_INDICES.has(globalIndex);
  }, [position, playerIndex]);

  if (DEBUG_UI) {
    console.debug(`Token render p${playerIndex}#${tokenIndex} at x=${pixelPosition.x}, y=${pixelPosition.y} (stack ${stackIndex + 1}/${stackCount})`);
  }

  return (
    <g
      className={`token-wrapper ludo-token token-player-${playerIndex} ${isFinished ? 'finished-token' : ''} ${isGlowing ? 'glowing' : ''} ${isAnimated ? 'animated' : ''} ${isDimmed ? 'dimmed' : ''}`}
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

      {/* Optional: small badge for stack size (only show on first index) */}
      {stackCount > 1 && stackIndex === 0 && (
        <g transform={`translate(${tokenRadius - 4}, ${-tokenRadius + 8})`}>
          <rect x="-8" y="-10" width="16" height="14" rx="3" ry="3" fill="rgba(0,0,0,0.7)" />
          <text x="0" y="0" fill="#fff" fontSize="9" textAnchor="middle" dominantBaseline="middle">{stackCount}</text>
        </g>
      )}

      {/* Safe cell ring indicator */}
      {isOnSafeCell && (
        <circle
          cx="0"
          cy="0"
          r={tokenRadius + 4}
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))' }}
        />
      )}
    </g>
  );
};

export default Token;
