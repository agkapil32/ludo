import React, { useEffect, useState, useRef, memo } from 'react';
import { getTokenPixelPosition, PLAYER_START_INDEX, logicalToGlobal, SAFE_GLOBAL_INDICES } from './boardLayout';
import RedToken from './tokens/RedToken';
import GreenToken from './tokens/GreenToken';
import BlueToken from './tokens/BlueToken';
import YellowToken from './tokens/YellowToken';

// Debug flag for optional UI logs
const DEBUG_UI = false; // Disable debug to reduce console spam

interface TokenProps {
  color: string;
  position: number;
  tokenIndex: number;
  playerIndex: number;
  isFinished?: boolean;
  isGlowing?: boolean;
  isAnimated?: boolean;
  onClick?: () => void;
  stackIndex: number;
  stackCount: number;
  isDimmed?: boolean;
  isMoving?: boolean;
  canMove?: boolean;
  previousPosition?: number;
  // Add current player to prevent hover on wrong tokens
  isCurrentPlayer?: boolean;
}

const Token: React.FC<TokenProps> = memo(({
  color,
  position,
  tokenIndex,
  playerIndex,
  isFinished = false,
  isGlowing = false,
  isAnimated = false,
  onClick,
  stackIndex,
  stackCount,
  isDimmed = false,
  isMoving = false,
  canMove = false,
  previousPosition,
  isCurrentPlayer = false
}) => {
  const [currentPixelPosition, setCurrentPixelPosition] = useState(() =>
    getTokenPixelPosition(playerIndex, tokenIndex, position)
  );
  const [isAnimatingMove, setIsAnimatingMove] = useState(false);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Animation duration and easing
  const ANIMATION_DURATION = 800; // 800ms for smooth movement
  const STEPS_PER_POSITION = 10; // Steps for smooth animation between positions

  // Easing function for smooth animation
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };

  // Animate token movement step by step across the path
  const animateToPosition = (fromPos: number, toPos: number) => {
    if (fromPos === toPos) return;

    setIsAnimatingMove(true);
    startTimeRef.current = performance.now();

    const startPixelPos = getTokenPixelPosition(playerIndex, tokenIndex, fromPos);
    const endPixelPos = getTokenPixelPosition(playerIndex, tokenIndex, toPos);

    // Calculate intermediate positions for step-by-step animation
    const pathSteps: { x: number; y: number }[] = [];

    if (fromPos >= 0 && toPos >= 0) {
      // Animate through each path position for smooth movement
      const stepCount = Math.abs(toPos - fromPos);
      const direction = toPos > fromPos ? 1 : -1;

      for (let i = 0; i <= stepCount * STEPS_PER_POSITION; i++) {
        const progress = i / (stepCount * STEPS_PER_POSITION);
        const currentLogicalPos = fromPos + (direction * stepCount * progress);
        const stepPixelPos = getTokenPixelPosition(playerIndex, tokenIndex, Math.floor(currentLogicalPos));
        pathSteps.push(stepPixelPos);
      }
    } else {
      // Direct animation for home to board or board to home
      for (let i = 0; i <= STEPS_PER_POSITION; i++) {
        const progress = i / STEPS_PER_POSITION;
        pathSteps.push({
          x: startPixelPos.x + (endPixelPos.x - startPixelPos.x) * progress,
          y: startPixelPos.y + (endPixelPos.y - startPixelPos.y) * progress
        });
      }
    }

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const easedProgress = easeInOutCubic(progress);

      // Get current step position
      const stepIndex = Math.floor(easedProgress * (pathSteps.length - 1));
      const currentStepPos = pathSteps[stepIndex] || endPixelPos;

      setCurrentPixelPosition(currentStepPos);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - ensure final position matches GameStateDTO
        setCurrentPixelPosition(endPixelPos);
        setIsAnimatingMove(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Update position when GameStateDTO changes (ensure sync with backend)
  useEffect(() => {
    const newPixelPosition = getTokenPixelPosition(playerIndex, tokenIndex, position);

    if (previousPosition !== undefined && previousPosition !== position) {
      // Animate from previous position to new position
      animateToPosition(previousPosition, position);
    } else {
      // Direct update without animation (initial render or same position)
      setCurrentPixelPosition(newPixelPosition);
    }

    // Cleanup animation on unmount or position change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [position, previousPosition, playerIndex, tokenIndex]);

  // Clean up moving state when animation completes
  useEffect(() => {
    if (!isAnimatingMove && isMoving) {
      // Animation has completed, notify parent to clean up moving state
      const cleanup = setTimeout(() => {
        // This helps ensure the moving state is cleared after animation
        if (window.boardCleanupMovingToken) {
          window.boardCleanupMovingToken(`${playerIndex}-${tokenIndex}`);
        }
      }, 100);

      return () => clearTimeout(cleanup);
    }
  }, [isAnimatingMove, isMoving, playerIndex, tokenIndex]);

  // Calculate stacking offset for overlapping tokens
  const stackOffset = stackCount > 1 ? {
    x: (stackIndex % 2) * 8 - 4,
    y: Math.floor(stackIndex / 2) * 8 - 4
  } : { x: 0, y: 0 };

  // Apply stack offset to current position
  const finalPosition = {
    x: currentPixelPosition.x + stackOffset.x,
    y: currentPixelPosition.y + stackOffset.y
  };

  // Determine token styling classes
  const tokenClasses = [
    'token',
    `token-${color.toLowerCase()}`,
    isGlowing && 'token-glowing',
    isAnimated && canMove && 'token-animated',
    isDimmed && 'token-dimmed',
    isAnimatingMove && 'token-moving',
    isFinished && 'token-finished',
    canMove && isCurrentPlayer && 'token-clickable'
  ].filter(Boolean).join(' ');

  if (DEBUG_UI) {
    console.debug(`Token render p${playerIndex}#${tokenIndex} at x=${finalPosition.x}, y=${finalPosition.y} canMove=${canMove} isCurrentPlayer=${isCurrentPlayer}`);
  }

  return (
    <g
      className={tokenClasses}
      transform={`translate(${finalPosition.x - 14}, ${finalPosition.y - 14})`}
      title={`Player ${playerIndex + 1} Token ${tokenIndex + 1} - Position: ${position}${isFinished ? ' (Finished)' : ''}${canMove ? ' (Can Move)' : ''}`}
      style={{
        cursor: canMove && isCurrentPlayer ? 'pointer' : 'default',
        pointerEvents: isCurrentPlayer && !isAnimatingMove ? 'auto' : 'none', // ENHANCED: Stricter hover control
        transition: 'all 0.2s ease-in-out' // Smooth state transitions
      }}
    >
      {/* ENHANCED: Safe position indicator with stability check */}
      {SAFE_GLOBAL_INDICES.has(logicalToGlobal(PLAYER_START_INDEX[playerIndex], position)) && !isAnimatingMove && (
        <circle
          cx="14"
          cy="14"
          r="18"
          fill="none"
          stroke="gold"
          strokeWidth="2"
          strokeDasharray="3,3"
          opacity="0.8"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from={`0 14 14`}
            to={`360 14 14`}
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* ENHANCED: Movement indicator - only for current player's stable movable tokens */}
      {canMove && isCurrentPlayer && !isAnimatingMove && (
        <circle
          cx="14"
          cy="14"
          r="22"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="2"
          strokeDasharray="4,4"
          opacity="0.7"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from={`0 14 14`}
            to={`360 14 14`}
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Your beautiful 3D token component */}
      <foreignObject x="0" y="0" width="28" height="28">
        {(() => {
          switch (playerIndex) {
            case 0: return <RedToken size={28} className={tokenClasses} isAnimated={canMove} isGlowing={isGlowing} onClick={canMove ? onClick : undefined} />;
            case 1: return <GreenToken size={28} className={tokenClasses} isAnimated={canMove} isGlowing={isGlowing} onClick={canMove ? onClick : undefined} />;
            case 2: return <BlueToken size={28} className={tokenClasses} isAnimated={canMove} isGlowing={isGlowing} onClick={canMove ? onClick : undefined} />;
            case 3: return <YellowToken size={28} className={tokenClasses} isAnimated={canMove} isGlowing={isGlowing} onClick={canMove ? onClick : undefined} />;
            default: return <RedToken size={28} className={tokenClasses} isAnimated={canMove} isGlowing={isGlowing} onClick={canMove ? onClick : undefined} />;
          }
        })()}
      </foreignObject>

      {/* Finished token crown overlay */}
      {isFinished && (
        <g transform={`translate(14, 7)`}>
          <polygon
            points="-6,-6 0,-12 6,-6 3,-3 -3,-3"
            fill="gold"
            stroke="orange"
            strokeWidth="1"
          />
          <circle cx="0" cy="-8" r="1.5" fill="yellow" />
          <animate
            attributeName="opacity"
            values="0.8;1;0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        </g>
      )}
    </g>
  );
});

export default Token;
