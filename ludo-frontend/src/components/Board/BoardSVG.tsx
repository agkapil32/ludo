import React from 'react';

interface BoardSVGProps {
  size?: number;
}

const BoardSVG: React.FC<BoardSVGProps> = ({ size = 600 }) => {
  const cellSize = size / 15;

  // Player colors for the four corners
  const playerColors = {
    red: '#e53935',
    green: '#43a047',
    blue: '#1e88e5',
    yellow: '#fdd835'
  };

  // Proper Ludo board path - 52 squares in clockwise direction
  const pathCells = [
    // Red starting area and initial path (0-5)
    { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },

    // Moving up to green area (6-11)
    { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 }, { x: 6, y: 0 },

    // Green starting squares (12-13)
    { x: 7, y: 0 }, { x: 8, y: 0 },

    // Moving down from green (14-18)
    { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },

    // Moving right to blue area (19-24)
    { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },

    // Blue starting squares (25-26)
    { x: 14, y: 7 }, { x: 14, y: 8 },

    // Moving left from blue (27-31)
    { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },

    // Moving down to yellow area (32-37)
    { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },

    // Yellow starting squares (38-39)
    { x: 7, y: 14 }, { x: 6, y: 14 },

    // Moving up from yellow (40-44)
    { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },

    // Final stretch back to red (45-51)
    { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 }, { x: 0, y: 7 }
  ];

  // Safe squares (star positions) - entry points and middle points
  const safeSquares = [1, 9, 14, 22, 27, 35, 40, 48]; // Adjusted for proper Ludo layout

  // Player starting positions
  const playerStarts = [0, 13, 26, 39]; // Red, Green, Blue, Yellow

  // Home straight paths for each player (colored columns leading to center)
  const homeColumns = {
    red: Array.from({length: 5}, (_, i) => ({ x: 1 + i, y: 7 })),
    green: Array.from({length: 5}, (_, i) => ({ x: 7, y: 1 + i })),
    blue: Array.from({length: 5}, (_, i) => ({ x: 13 - i, y: 7 })),
    yellow: Array.from({length: 5}, (_, i) => ({ x: 7, y: 13 - i }))
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ludo-board">
      {/* Board background */}
      <rect width={size} height={size} fill="#f8f9fa" stroke="#333" strokeWidth="4"/>

      {/* Grid lines for structure */}
      {Array.from({length: 16}, (_, i) => (
        <g key={`grid-${i}`}>
          <line x1={i * cellSize} y1={0} x2={i * cellSize} y2={size} stroke="#e0e0e0" strokeWidth="1"/>
          <line x1={0} y1={i * cellSize} x2={size} y2={i * cellSize} stroke="#e0e0e0" strokeWidth="1"/>
        </g>
      ))}

      {/* Player home areas (colored corners) */}
      <rect x={0} y={0} width={cellSize * 6} height={cellSize * 6} fill={playerColors.red} fillOpacity="0.3" stroke={playerColors.red} strokeWidth="3"/>
      <rect x={cellSize * 9} y={0} width={cellSize * 6} height={cellSize * 6} fill={playerColors.green} fillOpacity="0.3" stroke={playerColors.green} strokeWidth="3"/>
      <rect x={cellSize * 9} y={cellSize * 9} width={cellSize * 6} height={cellSize * 6} fill={playerColors.blue} fillOpacity="0.3" stroke={playerColors.blue} strokeWidth="3"/>
      <rect x={0} y={cellSize * 9} width={cellSize * 6} height={cellSize * 6} fill={playerColors.yellow} fillOpacity="0.3" stroke={playerColors.yellow} strokeWidth="3"/>

      {/* Center winning area - larger and more prominent */}
      <rect x={cellSize * 6} y={cellSize * 6} width={cellSize * 3} height={cellSize * 3} fill="#ffd700" fillOpacity="0.6" stroke="#333" strokeWidth="4"/>

      {/* Center triangle patterns */}
      <polygon points={`${cellSize * 7.5},${cellSize * 6.5} ${cellSize * 6.5},${cellSize * 8.5} ${cellSize * 8.5},${cellSize * 8.5}`} fill={playerColors.red} fillOpacity="0.7"/>
      <polygon points={`${cellSize * 7.5},${cellSize * 6.5} ${cellSize * 6.5},${cellSize * 6.5} ${cellSize * 6.5},${cellSize * 8.5}`} fill={playerColors.green} fillOpacity="0.7"/>
      <polygon points={`${cellSize * 7.5},${cellSize * 8.5} ${cellSize * 6.5},${cellSize * 6.5} ${cellSize * 8.5},${cellSize * 6.5}`} fill={playerColors.blue} fillOpacity="0.7"/>
      <polygon points={`${cellSize * 7.5},${cellSize * 8.5} ${cellSize * 8.5},${cellSize * 6.5} ${cellSize * 8.5},${cellSize * 8.5}`} fill={playerColors.yellow} fillOpacity="0.7"/>

      {/* Main path squares */}
      {pathCells.map((cell, index) => {
        const isSafe = safeSquares.includes(index);
        const isStart = playerStarts.includes(index);
        let fillColor = '#ffffff';
        let strokeColor = '#333';
        let strokeWidth = 2;

        if (isStart) {
          if (index === 0) fillColor = playerColors.red;
          else if (index === 13) fillColor = playerColors.green;
          else if (index === 26) fillColor = playerColors.blue;
          else if (index === 39) fillColor = playerColors.yellow;
          strokeWidth = 3;
        } else if (isSafe) {
          fillColor = '#ffe0b2';
          strokeColor = '#ff9800';
        }

        return (
          <rect
            key={`path-${index}`}
            x={cell.x * cellSize}
            y={cell.y * cellSize}
            width={cellSize}
            height={cellSize}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      })}

      {/* Home straight columns (colored paths to center) */}
      {Object.entries(homeColumns).map(([color, cells]) =>
        cells.map((cell, index) => (
          <rect
            key={`home-${color}-${index}`}
            x={cell.x * cellSize}
            y={cell.y * cellSize}
            width={cellSize}
            height={cellSize}
            fill={playerColors[color as keyof typeof playerColors]}
            fillOpacity="0.7"
            stroke="#333"
            strokeWidth="2"
          />
        ))
      )}

      {/* Safe square stars */}
      {pathCells.map((cell, index) => {
        if (!safeSquares.includes(index)) return null;
        const centerX = cell.x * cellSize + cellSize / 2;
        const centerY = cell.y * cellSize + cellSize / 2;
        const starSize = cellSize * 0.25;

        return (
          <g key={`star-${index}`}>
            <polygon
              points={`${centerX},${centerY - starSize} ${centerX + starSize * 0.3},${centerY - starSize * 0.3} ${centerX + starSize},${centerY - starSize * 0.3} ${centerX + starSize * 0.3},${centerY + starSize * 0.3} ${centerX + starSize},${centerY + starSize} ${centerX},${centerY + starSize * 0.6} ${centerX - starSize},${centerY + starSize} ${centerX - starSize * 0.3},${centerY + starSize * 0.3} ${centerX - starSize},${centerY - starSize * 0.3} ${centerX - starSize * 0.3},${centerY - starSize * 0.3}`}
              fill="#ff9800"
              stroke="#333"
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* Player token areas (4 circles in each corner) */}
      {[
        { color: 'red', startX: 1.5, startY: 1.5 },
        { color: 'green', startX: 10.5, startY: 1.5 },
        { color: 'blue', startX: 10.5, startY: 10.5 },
        { color: 'yellow', startX: 1.5, startY: 10.5 }
      ].map(({ color, startX, startY }) => (
        <g key={`token-area-${color}`}>
          {Array.from({length: 4}, (_, i) => {
            const x = startX + (i % 2) * 2;
            const y = startY + Math.floor(i / 2) * 2;
            return (
              <circle
                key={`token-spot-${color}-${i}`}
                cx={x * cellSize}
                cy={y * cellSize}
                r={cellSize * 0.35}
                fill="none"
                stroke={playerColors[color as keyof typeof playerColors]}
                strokeWidth="3"
                strokeDasharray="8,4"
              />
            );
          })}
        </g>
      ))}

      {/* Corner decorations */}
      {[
        { x: cellSize * 3, y: cellSize * 3, color: playerColors.red },
        { x: cellSize * 12, y: cellSize * 3, color: playerColors.green },
        { x: cellSize * 12, y: cellSize * 12, color: playerColors.blue },
        { x: cellSize * 3, y: cellSize * 12, color: playerColors.yellow }
      ].map(({ x, y, color }, index) => (
        <circle
          key={`corner-${index}`}
          cx={x}
          cy={y}
          r={cellSize * 0.8}
          fill="none"
          stroke={color}
          strokeWidth="4"
        />
      ))}
    </svg>
  );
};

export default BoardSVG;
