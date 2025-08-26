import React from 'react';

interface BoardSVGProps {
  size?: number;
}

const BoardSVG: React.FC<BoardSVGProps> = ({ size = 600 }) => {
  const cellSize = size / 15;

  // Enhanced player colors with gradients and better contrast
  const playerColors = {
    red: '#FF0000',     // 🟥 Pure red
    green: '#00A550',   // 🟩 Rich green (darker, nicer than plain #00FF00)
    blue: '#0000FF',    // 🟦 Pure blue
    yellow: '#FFD700'   // 🟨 Golden yellow (rich instead of pale)
  };

  // Corrected Ludo board path - 52 squares total following proper Ludo rules
  const pathCells = [
    // Red starting area - bottom left quadrant exit (0-5)
    { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },

    // Moving up the left side (6-11)
    { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 }, { x: 6, y: 0 },

    // Green starting area - top left quadrant exit (12-13)
    { x: 7, y: 0 }, { x: 8, y: 0 },

    // Moving down the right side of green (14-18)
    { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },

    // Moving right across the top (19-24)
    { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },

    // Blue starting area - top right quadrant exit (25-26)
    { x: 14, y: 7 }, { x: 14, y: 8 },

    // Moving left across the bottom of blue area (27-31)
    { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },

    // Moving down the right side (32-37)
    { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },

    // Yellow starting area - bottom right quadrant exit (38-39)
    { x: 7, y: 14 }, { x: 6, y: 14 },

    // Moving up the left side of yellow area (40-44)
    { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },

    // Final approach to red home column (45-51)
    { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 }, { x: 0, y: 7 }
  ];

  // Corrected safe squares positions to match LudoBoard2.png
  const safeSquares = [0, 8, 13, 21, 26, 34, 39, 47];

  // Player starting positions on the main path
  const playerStarts = [0, 13, 26, 39]; // Red, Green, Blue, Yellow

  // Home straight paths for each player (5 squares leading to center)
  const homeColumns = {
    red: Array.from({length: 5}, (_, i) => ({ x: 1 + i, y: 7 })),
    green: Array.from({length: 5}, (_, i) => ({ x: 7, y: 1 + i })),
    blue: Array.from({length: 5}, (_, i) => ({ x: 13 - i, y: 7 })),
    yellow: Array.from({length: 5}, (_, i) => ({ x: 7, y: 13 - i }))
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ludo-board">
      {/* Board background with gradient */}
      <defs>
        <radialGradient id="boardGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f5f5f5" />
        </radialGradient>

        {/* Player color gradients */}
        <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffcdd2" />
          <stop offset="100%" stopColor={playerColors.red} />
        </linearGradient>
        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8e6c9" />
          <stop offset="100%" stopColor={playerColors.green} />
        </linearGradient>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bbdefb" />
          <stop offset="100%" stopColor={playerColors.blue} />
        </linearGradient>
        <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe0b2" />
          <stop offset="100%" stopColor={playerColors.yellow} />
        </linearGradient>
      </defs>

      <rect width={size} height={size} fill="url(#boardGradient)" stroke="#2c3e50" strokeWidth="6" rx="10"/>

      {/* Subtle grid lines for structure */}
      {Array.from({length: 16}, (_, i) => (
        <g key={`grid-${i}`} opacity="0.3">
          <line x1={i * cellSize} y1={0} x2={i * cellSize} y2={size} stroke="#bdc3c7" strokeWidth="0.5"/>
          <line x1={0} y1={i * cellSize} x2={size} y2={i * cellSize} stroke="#bdc3c7" strokeWidth="0.5"/>
        </g>
      ))}

      {/* Player home areas with gradients and rounded corners */}
      <rect x={cellSize * 0.2} y={cellSize * 0.2} width={cellSize * 5.6} height={cellSize * 5.6}
            fill="url(#redGradient)" stroke={playerColors.red} strokeWidth="4" rx="8"/>
      <rect x={cellSize * 9.2} y={cellSize * 0.2} width={cellSize * 5.6} height={cellSize * 5.6}
            fill="url(#greenGradient)" stroke={playerColors.green} strokeWidth="4" rx="8"/>
      <rect x={cellSize * 9.2} y={cellSize * 9.2} width={cellSize * 5.6} height={cellSize * 5.6}
            fill="url(#blueGradient)" stroke={playerColors.blue} strokeWidth="4" rx="8"/>
      <rect x={cellSize * 0.2} y={cellSize * 9.2} width={cellSize * 5.6} height={cellSize * 5.6}
            fill="url(#yellowGradient)" stroke={playerColors.yellow} strokeWidth="4" rx="8"/>

      {/* Enhanced center winning area */}
      <rect x={cellSize * 6} y={cellSize * 6} width={cellSize * 3} height={cellSize * 3}
            fill="#ffd700" stroke="#f39c12" strokeWidth="5" rx="6"/>

      {/* Center crown symbol */}
      <g transform={`translate(${cellSize * 7.5}, ${cellSize * 7.5})`}>
        <polygon points="-15,-10 -5,-15 5,-10 15,-15 15,10 -15,10"
                 fill="#f39c12" stroke="#e67e22" strokeWidth="2"/>
        <circle cx="0" cy="-5" r="3" fill="#e74c3c"/>
        <circle cx="-8" cy="-8" r="2" fill="#e74c3c"/>
        <circle cx="8" cy="-8" r="2" fill="#e74c3c"/>
      </g>

      {/* Center triangle patterns with improved design */}
      <polygon points={`${cellSize * 7.5},${cellSize * 6.2} ${cellSize * 6.2},${cellSize * 8.8} ${cellSize * 8.8},${cellSize * 8.8}`}
               fill={playerColors.red} fillOpacity="0.8" stroke="#fff" strokeWidth="1"/>
      <polygon points={`${cellSize * 7.5},${cellSize * 6.2} ${cellSize * 6.2},${cellSize * 6.2} ${cellSize * 6.2},${cellSize * 8.8}`}
               fill={playerColors.green} fillOpacity="0.8" stroke="#fff" strokeWidth="1"/>
      <polygon points={`${cellSize * 7.5},${cellSize * 8.8} ${cellSize * 6.2},${cellSize * 6.2} ${cellSize * 8.8},${cellSize * 6.2}`}
               fill={playerColors.blue} fillOpacity="0.8" stroke="#fff" strokeWidth="1"/>
      <polygon points={`${cellSize * 7.5},${cellSize * 8.8} ${cellSize * 8.8},${cellSize * 6.2} ${cellSize * 8.8},${cellSize * 8.8}`}
               fill={playerColors.yellow} fillOpacity="0.8" stroke="#fff" strokeWidth="1"/>

      {/* Main path squares with enhanced styling */}
      {pathCells.map((cell, index) => {
        const isSafe = safeSquares.includes(index);
        const isStart = playerStarts.includes(index);
        let fillColor = '#ffffff';
        let strokeColor = '#34495e';
        let strokeWidth = 2;

        if (isStart) {
          if (index === 0) fillColor = playerColors.red;
          else if (index === 13) fillColor = playerColors.green;
          else if (index === 26) fillColor = playerColors.blue;
          else if (index === 39) fillColor = playerColors.yellow;
          strokeWidth = 4;
          strokeColor = '#2c3e50';
        } else if (isSafe) {
          fillColor = '#fff3e0';
          strokeColor = '#ff9800';
          strokeWidth = 3;
        }

        return (
          <rect
            key={`path-${index}`}
            x={cell.x * cellSize + 1}
            y={cell.y * cellSize + 1}
            width={cellSize - 2}
            height={cellSize - 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx="2"
          />
        );
      })}

      {/* Home straight columns with gradient effects */}
      {Object.entries(homeColumns).map(([color, cells]) =>
        cells.map((cell, index) => (
          <rect
            key={`home-${color}-${index}`}
            x={cell.x * cellSize + 1}
            y={cell.y * cellSize + 1}
            width={cellSize - 2}
            height={cellSize - 2}
            fill={playerColors[color as keyof typeof playerColors]}
            fillOpacity="0.8"
            stroke="#fff"
            strokeWidth="2"
            rx="2"
          />
        ))
      )}

      {/* Enhanced safe square stars */}
      {pathCells.map((cell, index) => {
        if (!safeSquares.includes(index)) return null;
        const centerX = cell.x * cellSize + cellSize / 2;
        const centerY = cell.y * cellSize + cellSize / 2;
        const starSize = cellSize * 0.3;

        return (
          <g key={`star-${index}`}>
            <polygon
              points={`${centerX},${centerY - starSize} ${centerX + starSize * 0.3},${centerY - starSize * 0.3} ${centerX + starSize},${centerY - starSize * 0.3} ${centerX + starSize * 0.3},${centerY + starSize * 0.3} ${centerX + starSize},${centerY + starSize} ${centerX},${centerY + starSize * 0.6} ${centerX - starSize},${centerY + starSize} ${centerX - starSize * 0.3},${centerY + starSize * 0.3} ${centerX - starSize},${centerY - starSize * 0.3} ${centerX - starSize * 0.3},${centerY - starSize * 0.3}`}
              fill="#ff9800"
              stroke="#f57c00"
              strokeWidth="2"
            />
          </g>
        );
      })}

      {/* Enhanced player token areas */}
      {[
        { color: 'red', startX: 1.5, startY: 1.5 },
        { color: 'green', startX: 10.5, startY: 1.5 },
        { color: 'blue', startX: 10.5, startY: 10.5 },
        { color: 'yellow', startX: 1.5, startY: 10.5 }
      ].map(({ color, startX, startY }) => (
        <g key={`token-area-${color}`}>
          {Array.from({length: 4}, (_, i) => {
            const x = startX + (i % 2) * 2.5;
            const y = startY + Math.floor(i / 2) * 2.5;
            return (
              <g key={`token-spot-${color}-${i}`}>
                {/* Outer circle for 3D effect */}
                <circle
                  cx={x * cellSize}
                  cy={y * cellSize}
                  r={cellSize * 0.4}
                  fill="rgba(0,0,0,0.2)"
                />
                {/* Inner circle */}
                <circle
                  cx={x * cellSize - 1}
                  cy={y * cellSize - 1}
                  r={cellSize * 0.38}
                  fill="none"
                  stroke={playerColors[color as keyof typeof playerColors]}
                  strokeWidth="3"
                  strokeDasharray="12,3"
                />
                {/* Center dot */}
                <circle
                  cx={x * cellSize - 1}
                  cy={y * cellSize - 1}
                  r={cellSize * 0.08}
                  fill={playerColors[color as keyof typeof playerColors]}
                />
              </g>
            );
          })}
        </g>
      ))}

      {/* Corner decorative elements */}
      {[
        { x: cellSize * 3, y: cellSize * 3, color: playerColors.red },
        { x: cellSize * 12, y: cellSize * 3, color: playerColors.green },
        { x: cellSize * 12, y: cellSize * 12, color: playerColors.blue },
        { x: cellSize * 3, y: cellSize * 12, color: playerColors.yellow }
      ].map(({ x, y, color }, index) => (
        <g key={`corner-${index}`}>
          <circle cx={x} cy={y} r={cellSize * 0.6} fill="rgba(255,255,255,0.3)" stroke={color} strokeWidth="3"/>
          <circle cx={x} cy={y} r={cellSize * 0.3} fill={color} fillOpacity="0.7"/>
        </g>
      ))}
    </svg>
  );
};

export default BoardSVG;
