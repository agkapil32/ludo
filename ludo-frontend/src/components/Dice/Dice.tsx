import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import diceSprite from '../../assets/board/LudoDices2.jpg';
import './Dice.css';

// Constants for better maintainability
const DICE_POSITIONS = { '?': 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 } as const;
const SIZE_CLASSES = {
  small: 'dice-face-small',
  medium: 'dice-face-medium',
  large: 'dice-face-large'
} as const;
const ANIMATION_SEQUENCE = ['?', 1, 3, 5, 2, 4, 6, 1, 4, 2, 5, 3] as const;
const MAX_ROLLS = 3;
const DWELL_MS = 800; // minimum time to keep final face visible
const MIN_ROLL_MS = 800; // minimum rolling animation duration

interface DiceAnimationState {
  isAnimating: boolean;
  currentFace: number | '?';
  finalValue: number | null;
  lastProcessedRoll: string | null; // Track which roll we've processed
}

interface DiceFaceProps {
  value: number | '?';
  isRolling?: boolean;
  size?: keyof typeof SIZE_CLASSES;
  showValue?: boolean;
}

// Restored original DiceFace component
const DiceFace: React.FC<DiceFaceProps> = ({
  value,
  isRolling = false,
  size = 'medium',
  showValue = true
}) => {
  const spritePosition = DICE_POSITIONS[value as keyof typeof DICE_POSITIONS] || 0;
  const backgroundPositionX = -(spritePosition * (100 / 7));

  const className = useMemo(() => {
    const classes = [
      'dice-face-image',
      SIZE_CLASSES[size],
      isRolling && 'rolling',
      value === 6 && 'six-face',
      value === '?' && 'question-face'
    ].filter(Boolean).join(' ');
    return classes;
  }, [size, isRolling, value]);

  return (
    <div className={className}>
      <div
        className="dice-sprite"
        style={{
          backgroundImage: `url(${diceSprite})`,
          backgroundPosition: `${backgroundPositionX}% 0`,
          backgroundSize: '700% 100%',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {value === '?' && <div className="dice-question-overlay">?</div>}
      {typeof value === 'number' && showValue && (
        <div className={`dice-dots-overlay dice-pattern-${value}`}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="dice-dot" />
          ))}
        </div>
      )}
      {value === 6 && <div className="dice-six-glow"></div>}
    </div>
  );
};

const Dice: React.FC = () => {
  const { gameState, rollDice, isRolling } = useGame();
  const [animationState, setAnimationState] = useState<DiceAnimationState>({
    isAnimating: false,
    currentFace: '?',
    finalValue: null,
    lastProcessedRoll: null
  });

  // Refs for lifecycle control
  const lastRollIdRef = useRef<string | null>(null);
  const rollingIntervalRef = useRef<number | null>(null);
  const safetyTimeoutRef = useRef<number | null>(null);
  const dwellTimeoutRef = useRef<number | null>(null);
  const lastFaceShownAtRef = useRef<number | null>(null);
  const rollStartAtRef = useRef<number | null>(null);
  const finalizeTimeoutRef = useRef<number | null>(null);
  const gameStateRef = useRef(gameState);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // ✅ SIMPLIFIED: Use DTO data directly, minimal computation
  const diceData = useMemo(() => {
    const rolls = gameState?.currentDiceRolls || [];
    const latestRoll = rolls[rolls.length - 1];
    return {
      currentDiceRolls: rolls,
      latestRoll,
      hasRolls: rolls.length > 0,
      lastDiceRoll: (gameState as any)?.lastDiceRoll || null
    };
  }, [gameState?.currentDiceRolls, (gameState as any)?.lastDiceRoll]);

  // ✅ HELPER: Check if current user's turn (simple DTO check)
  const isMyTurn = useMemo(() => {
    const currentPlayerName = localStorage.getItem('currentPlayerName');
    return gameState && currentPlayerName
      ? gameState.players[gameState.currentPlayerIndex]?.name === currentPlayerName
      : false;
  }, [gameState]);

  // Helper to finalize a roll and show the final face
  const finalizeRoll = useCallback((rollValue: number, currentRollId: string) => {
    if (rollingIntervalRef.current) {
      window.clearInterval(rollingIntervalRef.current);
      rollingIntervalRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      window.clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    if (dwellTimeoutRef.current) {
      window.clearTimeout(dwellTimeoutRef.current);
      dwellTimeoutRef.current = null;
    }

    lastFaceShownAtRef.current = Date.now();

    setAnimationState(prev => ({
      ...prev,
      isAnimating: false,
      currentFace: rollValue,
      finalValue: rollValue,
      lastProcessedRoll: currentRollId
    }));
  }, []);

  // Stop rolling and show final value from DTO whenever a new dice result arrives, but honor MIN_ROLL_MS
  useEffect(() => {
    if (!diceData.latestRoll) return;

    const rollValue = diceData.latestRoll.move;
    const currentRollId = `${rollValue}-${diceData.currentDiceRolls.length}-${gameState?.currentPlayerIndex}`;

    if (currentRollId === lastRollIdRef.current) return;

    lastRollIdRef.current = currentRollId;

    const now = Date.now();
    const startedAt = rollStartAtRef.current ?? now;
    const elapsed = now - startedAt;
    const remainingRoll = Math.max(0, MIN_ROLL_MS - elapsed);

    if (finalizeTimeoutRef.current) {
      window.clearTimeout(finalizeTimeoutRef.current);
      finalizeTimeoutRef.current = null;
    }

    if (remainingRoll > 0) {
      finalizeTimeoutRef.current = window.setTimeout(() => {
        finalizeRoll(rollValue, currentRollId);
        finalizeTimeoutRef.current = null;
      }, remainingRoll);
    } else {
      finalizeRoll(rollValue, currentRollId);
    }
  }, [diceData.latestRoll?.move, diceData.currentDiceRolls.length, gameState?.currentPlayerIndex, finalizeRoll]);

  // Fallback: if backend cleared currentDiceRolls due to turn change but provided lastDiceRoll, use it to finalize
  useEffect(() => {
    if (diceData.latestRoll || !diceData.lastDiceRoll) return;

    const { move, playerIndex, timestamp, rollId } = diceData.lastDiceRoll;
    const currentRollId = `last-${move}-${playerIndex}-${timestamp ?? ''}-${rollId ?? ''}`;

    if (currentRollId === lastRollIdRef.current) return;
    lastRollIdRef.current = currentRollId;

    const now = Date.now();
    const startedAt = rollStartAtRef.current ?? now;
    const elapsed = now - startedAt;
    const remainingRoll = Math.max(0, MIN_ROLL_MS - elapsed);

    if (finalizeTimeoutRef.current) {
      window.clearTimeout(finalizeTimeoutRef.current);
      finalizeTimeoutRef.current = null;
    }

    if (remainingRoll > 0) {
      finalizeTimeoutRef.current = window.setTimeout(() => {
        finalizeRoll(move, currentRollId);
        finalizeTimeoutRef.current = null;
      }, remainingRoll);
    } else {
      finalizeRoll(move, currentRollId);
    }
  }, [diceData.latestRoll, diceData.lastDiceRoll, finalizeRoll]);

  // Helper to apply the UI reset for a new turn
  const applyTurnReset = useCallback(() => {
    if (rollingIntervalRef.current) {
      window.clearInterval(rollingIntervalRef.current);
      rollingIntervalRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      window.clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    if (dwellTimeoutRef.current) {
      window.clearTimeout(dwellTimeoutRef.current);
      dwellTimeoutRef.current = null;
    }
    if (finalizeTimeoutRef.current) {
      window.clearTimeout(finalizeTimeoutRef.current);
      finalizeTimeoutRef.current = null;
    }

    lastRollIdRef.current = null;
    lastFaceShownAtRef.current = null;
    rollStartAtRef.current = null;

    // Read latest dice for current player safely
    const gs = gameStateRef.current;
    const rolls = gs?.currentDiceRolls ?? [];
    const nextFace: number | '?' = rolls.length ? rolls[rolls.length - 1].move : '?';

    setAnimationState({
      isAnimating: false,
      currentFace: nextFace,
      finalValue: typeof nextFace === 'number' ? nextFace : null,
      lastProcessedRoll: null
    });
  }, []);

  // Stop animation and reset markers when the turn changes, respecting both MIN_ROLL_MS and DWELL_MS
  useEffect(() => {
    const now = Date.now();

    // If still rolling or finalization is pending, wait for rolling min duration + dwell
    if (animationState.isAnimating || finalizeTimeoutRef.current) {
      const startedAt = rollStartAtRef.current ?? now;
      const remainingRoll = Math.max(0, MIN_ROLL_MS - (now - startedAt));
      if (dwellTimeoutRef.current) window.clearTimeout(dwellTimeoutRef.current);
      dwellTimeoutRef.current = window.setTimeout(() => {
        applyTurnReset();
      }, remainingRoll + DWELL_MS);
      return;
    }

    // Otherwise, if we already showed a final face, honor remaining dwell
    const lastShown = lastFaceShownAtRef.current;
    const remainingDwell = lastShown ? Math.max(0, DWELL_MS - (now - lastShown)) : 0;

    if (remainingDwell > 0) {
      if (dwellTimeoutRef.current) window.clearTimeout(dwellTimeoutRef.current);
      dwellTimeoutRef.current = window.setTimeout(() => {
        applyTurnReset();
      }, remainingDwell);
    } else {
      applyTurnReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.currentPlayerIndex]);

  // Dice roll handler
  const handleRollDice = useCallback(async () => {
    if (!isMyTurn) {
      alert('❌ It\'s not your turn! Wait for your turn to roll the dice.');
      return;
    }

    try {
      setAnimationState(prev => ({ ...prev, isAnimating: true, currentFace: '?' }));

      // Cancel any pending dwell/finalize from a previous roll
      if (dwellTimeoutRef.current) {
        window.clearTimeout(dwellTimeoutRef.current);
        dwellTimeoutRef.current = null;
      }
      if (finalizeTimeoutRef.current) {
        window.clearTimeout(finalizeTimeoutRef.current);
        finalizeTimeoutRef.current = null;
      }

      rollStartAtRef.current = Date.now();

      // Visual shuffle while waiting for API
      if (rollingIntervalRef.current) {
        window.clearInterval(rollingIntervalRef.current);
      }
      rollingIntervalRef.current = window.setInterval(() => {
        const next = ANIMATION_SEQUENCE[Math.floor(Math.random() * ANIMATION_SEQUENCE.length)];
        setAnimationState(prev => ({ ...prev, currentFace: next }));
      }, 150);

      // Safety timeout: never let animation run forever
      if (safetyTimeoutRef.current) {
        window.clearTimeout(safetyTimeoutRef.current);
      }
      safetyTimeoutRef.current = window.setTimeout(() => {
        if (rollingIntervalRef.current) {
          window.clearInterval(rollingIntervalRef.current);
          rollingIntervalRef.current = null;
        }
        setAnimationState(prev => ({ ...prev, isAnimating: false }));
      }, 7000);

      await rollDice();
      // Effect will finalize when gameState updates
    } catch (error) {
      console.error('Failed to roll dice:', error);
      if (rollingIntervalRef.current) {
        window.clearInterval(rollingIntervalRef.current);
        rollingIntervalRef.current = null;
      }
      if (safetyTimeoutRef.current) {
        window.clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      if (dwellTimeoutRef.current) {
        window.clearTimeout(dwellTimeoutRef.current);
        dwellTimeoutRef.current = null;
      }
      if (finalizeTimeoutRef.current) {
        window.clearTimeout(finalizeTimeoutRef.current);
        finalizeTimeoutRef.current = null;
      }
      setAnimationState(prev => ({ ...prev, isAnimating: false, currentFace: '?', finalValue: null }));
      const errorMessage = error instanceof Error ? error.message : 'Failed to roll dice';
      alert(`❌ Dice Roll Failed: ${errorMessage}`);
    }
  }, [rollDice, isMyTurn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rollingIntervalRef.current) {
        window.clearInterval(rollingIntervalRef.current);
      }
      if (safetyTimeoutRef.current) {
        window.clearTimeout(safetyTimeoutRef.current);
      }
      if (dwellTimeoutRef.current) {
        window.clearTimeout(dwellTimeoutRef.current);
      }
      if (finalizeTimeoutRef.current) {
        window.clearTimeout(finalizeTimeoutRef.current);
      }
    };
  }, []);

  // ✅ SIMPLIFIED: UI state based on DTO data only
  const uiState = useMemo(() => {
    let statusMessage = "🎯 Click to roll the dice and start your turn!";
    let buttonText = "🎲 Roll Dice";

    if (!isMyTurn) {
      statusMessage = "⏳ Wait for your turn to roll the dice";
      buttonText = "🚫 Not Your Turn";
    } else if (animationState.isAnimating) {
      statusMessage = "🎲 Rolling the dice...";
      buttonText = "🎲 Rolling...";
    } else if (isRolling) {
      statusMessage = "🔄 Processing roll...";
      buttonText = "🔄 Processing...";
    } else if (diceData.hasRolls) {
      statusMessage = "✅ Dice rolled. Select a token to move.";
      buttonText = "✅ Move Token";
    }

    // ✅ SIMPLIFIED: Basic roll permission (backend handles complex logic)
    const canRoll = isMyTurn && !isRolling && !animationState.isAnimating;

    const buttonClassName = [
      'roll-button-enhanced',
      !canRoll && 'disabled',
      !isMyTurn && 'not-your-turn',
      animationState.isAnimating && 'rolling'
    ].filter(Boolean).join(' ');

    const statusClassName = [
      'roll-status-enhanced',
      !isMyTurn && 'waiting'
    ].filter(Boolean).join(' ');

    return {
      statusMessage,
      buttonText,
      canRoll,
      buttonClassName,
      statusClassName
    };
  }, [diceData, animationState, isRolling, isMyTurn]);

  // ✅ FIXED: Show dice value from DTO with proper initial state
  const getDiceDisplay = () => {
    // Show rolling animation when isAnimating is true
    if (animationState.isAnimating) {
      return (
        <DiceFace
          value={animationState.currentFace}
          isRolling={true}
          size="large"
          showValue={animationState.currentFace !== '?'}
        />
      );
    }

    // ✅ FIXED: Show "?" when no dice have been rolled, otherwise show latest roll
    let displayValue: number | '?' = '?';

    if (diceData.hasRolls && diceData.latestRoll) {
      displayValue = diceData.latestRoll.move;
    } else if (animationState.finalValue) {
      displayValue = animationState.finalValue;
    }

    return (
      <DiceFace
        value={displayValue}
        size="large"
        isRolling={false}
      />
    );
  };

  return (
    <div className="dice-container">
      {/* Main Dice Display */}
      <div className="dice-main-section">
        <div className="dice-display-area">
          {getDiceDisplay()}
        </div>

        {/* Roll Button */}
        <button
          onClick={handleRollDice}
          disabled={!uiState.canRoll}
          className={uiState.buttonClassName}
          aria-label="Roll dice"
        >
          {uiState.buttonText}
        </button>

        {/* Status Display */}
        <div className={uiState.statusClassName} role="status" aria-live="polite">
          {uiState.statusMessage}
        </div>

        {/* ✅ SIMPLIFIED: Show DTO data directly */}
        {diceData.hasRolls && isMyTurn && (
          <div className="current-dice-display">
            <h4>Available Dice Values This Turn</h4>
            <div className="dice-results-grid">
              {diceData.currentDiceRolls.map((roll, index) => (
                <div key={index} className={`dice-result-item ${roll.isUsed ? 'used' : 'available'}`}>
                  <DiceFace
                    value={roll.move}
                    size="small"
                  />
                  <span className="roll-number">#{index + 1}</span>
                  <span className={`usage-status ${roll.isUsed ? 'used' : 'available'}`}>
                    {roll.isUsed ? '✅ Used' : '🎯 Available'}
                  </span>
                </div>
              ))}
            </div>

            {/* ✅ SIMPLIFIED: Basic summary from DTO data */}
            <div className="dice-summary">
              <p>Total Rolls: {diceData.currentDiceRolls.length}</p>
              <p>Available Dice: {diceData.currentDiceRolls.filter(roll => !roll.isUsed).length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dice;
