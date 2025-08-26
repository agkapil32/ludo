import React from 'react';

interface RedTokenProps {
  size?: number;
  className?: string;
  isAnimated?: boolean;
  isGlowing?: boolean;
  onClick?: () => void;
}

const RedToken: React.FC<RedTokenProps> = ({
  size = 32,
  className = '',
  isAnimated = false,
  isGlowing = false,
  onClick
}) => {
  const tokenId = `red-token-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`ludo-token red-token ${className} ${isAnimated ? 'animated' : ''} ${isGlowing ? 'glowing' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <defs>
        {/* Main gradient for the token */}
        <radialGradient id={`${tokenId}-main`} cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="40%" stopColor="#FF0000" />
          <stop offset="80%" stopColor="#cc0000" />
          <stop offset="100%" stopColor="#990000" />
        </radialGradient>

        {/* Glossy highlight gradient */}
        <radialGradient id={`${tokenId}-highlight`} cx="0.3" cy="0.2" r="0.4">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Shadow filter */}
        <filter id={`${tokenId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.3)" />
        </filter>

        {/* Glow filter */}
        <filter id={`${tokenId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Drop shadow */}
      <ellipse
        cx="32"
        cy="58"
        rx="24"
        ry="4"
        fill="rgba(0,0,0,0.2)"
        opacity="0.6"
      />

      {/* Main token body */}
      <circle
        cx="32"
        cy="28"
        r="26"
        fill={`url(#${tokenId}-main)`}
        stroke="#8b0000"
        strokeWidth="1.5"
        filter={`url(#${tokenId}-shadow) ${isGlowing ? `url(#${tokenId}-glow)` : ''}`}
      />

      {/* Inner border */}
      <circle
        cx="32"
        cy="28"
        r="22"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />

      {/* Glossy highlight */}
      <ellipse
        cx="26"
        cy="22"
        rx="12"
        ry="8"
        fill={`url(#${tokenId}-highlight)`}
      />

      {/* Small center highlight */}
      <circle
        cx="28"
        cy="24"
        r="3"
        fill="rgba(255,255,255,0.6)"
      />

      {isAnimated && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 32 32;360 32 32"
          dur="2s"
          repeatCount="indefinite"
        />
      )}
    </svg>
  );
};

export default RedToken;
