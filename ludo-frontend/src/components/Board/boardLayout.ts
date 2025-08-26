// Board layout constants for Ludo
// Updated for corrected SVG board layout and proper Ludo functionality

export const BOARD_PX = 600; // Match SVG board size
export const CELL_SIZE = BOARD_PX / 15; // Each of the 15 grid cells
export const GRID_DIM = 15; // Dimension of the logical grid
export const TOKEN_DIAMETER = 28;

// Corrected path mapping (52 main track squares) as (row,col) in 15x15 grid.
// Following proper Ludo board clockwise pattern starting from red exit
export const PATH_CELLS: { r: number; c: number }[] = [
  // Red starting area and initial path (0-5)
  { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },

  // Moving up to green area (6-11)
  { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },

  // Green starting squares (12-13)
  { r: 0, c: 7 }, { r: 0, c: 8 },

  // Moving down from green (14-18)
  { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },

  // Moving right to blue area (19-24)
  { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },

  // Blue starting squares (25-26)
  { r: 7, c: 14 }, { r: 8, c: 14 },

  // Moving left from blue (27-31)
  { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },

  // Moving down to yellow area (32-37)
  { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },

  // Yellow starting squares (38-39)
  { r: 14, c: 7 }, { r: 14, c: 6 },

  // Moving up from yellow (40-44)
  { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },

  // Final stretch back to red (45-51)
  { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 }, { r: 7, c: 0 }
];

// Player start indices (where each player begins their journey)
export const PLAYER_START_INDEX = [0, 13, 26, 39]; // Red, Green, Blue, Yellow

// Safe cells (star positions) - corrected based on actual Ludo board layout
// Stars should be at: position 1 from each start, position 8 from each start, and entry squares
export const SAFE_GLOBAL_INDICES = new Set([
  1,   // Red safe square (near red start)
  8,   // Red second safe square
  14,  // Green entry square
  22,  // Green second safe square
  27,  // Blue entry square
  35,  // Blue second safe square
  40,  // Yellow entry square
  48   // Yellow second safe square
]);

// Home yard positions for 4 tokens per player (pixel coordinates) - corrected positioning
export const HOME_CLUSTERS: { x: number; y: number }[][] = [
  // Red player home (top-left) - better spacing
  [
    { x: CELL_SIZE * 1.5, y: CELL_SIZE * 1.5 },
    { x: CELL_SIZE * 3.5, y: CELL_SIZE * 1.5 },
    { x: CELL_SIZE * 1.5, y: CELL_SIZE * 3.5 },
    { x: CELL_SIZE * 3.5, y: CELL_SIZE * 3.5 }
  ],
  // Green player home (top-right)
  [
    { x: CELL_SIZE * 10.5, y: CELL_SIZE * 1.5 },
    { x: CELL_SIZE * 12.5, y: CELL_SIZE * 1.5 },
    { x: CELL_SIZE * 10.5, y: CELL_SIZE * 3.5 },
    { x: CELL_SIZE * 12.5, y: CELL_SIZE * 3.5 }
  ],
  // Blue player home (bottom-right)
  [
    { x: CELL_SIZE * 10.5, y: CELL_SIZE * 10.5 },
    { x: CELL_SIZE * 12.5, y: CELL_SIZE * 10.5 },
    { x: CELL_SIZE * 10.5, y: CELL_SIZE * 12.5 },
    { x: CELL_SIZE * 12.5, y: CELL_SIZE * 12.5 }
  ],
  // Yellow player home (bottom-left)
  [
    { x: CELL_SIZE * 1.5, y: CELL_SIZE * 10.5 },
    { x: CELL_SIZE * 3.5, y: CELL_SIZE * 10.5 },
    { x: CELL_SIZE * 1.5, y: CELL_SIZE * 12.5 },
    { x: CELL_SIZE * 3.5, y: CELL_SIZE * 12.5 }
  ]
];

// Convert path index to pixel coordinates
export function pathIndexToPixel(index: number): { x: number; y: number } {
  if (index < 0 || index >= PATH_CELLS.length) {
    // Return center position for invalid indices
    console.warn(`Invalid path index: ${index}, PATH_CELLS.length: ${PATH_CELLS.length}`);
    return { x: BOARD_PX/2, y: BOARD_PX/2 };
  }

  // Use actual array length instead of hardcoded 52
  const safeIndex = index % PATH_CELLS.length;
  const pathCell = PATH_CELLS[safeIndex];

  if (!pathCell) {
    console.error(`PATH_CELLS[${safeIndex}] is undefined. Array length: ${PATH_CELLS.length}`);
    return { x: BOARD_PX/2, y: BOARD_PX/2 };
  }

  const { r, c } = pathCell;
  return {
    x: c * CELL_SIZE + CELL_SIZE / 2,
    y: r * CELL_SIZE + CELL_SIZE / 2,
  };
}

// Convert logical position to global path index
export function logicalToGlobal(playerStartOffset: number, logicalPos: number): number {

  return (playerStartOffset + logicalPos) % PATH_CELLS.length;
}

// Get home token position for tokens still in yard
export function getHomeTokenPosition(playerIndex: number, tokenIndex: number): { x: number; y: number } {
  const cluster = HOME_CLUSTERS[playerIndex];
  if (!cluster || tokenIndex >= cluster.length) {
    // Fallback to center position if invalid
    return { x: BOARD_PX/2, y: BOARD_PX/2 };
  }
  return cluster[tokenIndex];
}

// Get pixel position for any token (home or on board)
export function getTokenPixelPosition(playerIndex: number, tokenIndex: number, logicalPos: number): { x: number; y: number } {
  if (logicalPos === -1) {
    return getHomeTokenPosition(playerIndex, tokenIndex);
  }

  // Handle home straight (positions 50+ are home straight for each player)
  if (logicalPos >= 50) {
    const homePos = logicalPos - 50;
    const homeColumns = [
      // Red home column
      Array.from({length: 5}, (_, i) => ({ x: (1 + i) * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2 })),
      // Green home column
      Array.from({length: 5}, (_, i) => ({ x: 7 * CELL_SIZE + CELL_SIZE / 2, y: (1 + i) * CELL_SIZE + CELL_SIZE / 2 })),
      // Blue home column
      Array.from({length: 5}, (_, i) => ({ x: (13 - i) * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2 })),
      // Yellow home column
      Array.from({length: 5}, (_, i) => ({ x: 7 * CELL_SIZE + CELL_SIZE / 2, y: (13 - i) * CELL_SIZE + CELL_SIZE / 2 }))
    ];

    if (homePos < 5 && homeColumns[playerIndex] && homeColumns[playerIndex][homePos]) {
      return homeColumns[playerIndex][homePos];
    }
  }

  const global = logicalToGlobal(PLAYER_START_INDEX[playerIndex], logicalPos);
  return pathIndexToPixel(global);
}
